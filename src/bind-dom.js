var OBSERVERS = {};
var inputNodeName = 'INPUT';
var textAreaNodeName = 'TEXTAREA';

function _getElementValue(node) {
	if (node.nodeName === inputNodeName) {
		return node.getAttribute('value');
	}

	if (node.nodeName === textAreaNodeName) {
		return node.value;
	}

	return node.textContent;
}

function _setElementValue(node, value) {
	if (node.nodeName === inputNodeName) {
		node.setAttribute('value', value);
	} else if (node.nodeName === textAreaNodeName) {
		node.value = value;
	} else {
		node.innerHTML = value;
	}
}

function _initObserver(targetNode, toNode, config, type, observerName) {
	var members = (config && config.members) || { attributes: true, childList: true, characterData: true };
	var callback = (config && config.callback) || _callBack;

	function _callBack(mutationsList) {
		for (var i = 0; i < mutationsList.length; i++) {
			var targetNodeValue = _getElementValue(mutationsList[i].target);
			var toNodeValue = _getElementValue(toNode);

			if (type === 'oneTime') {
				_setElementValue(toNode, targetNodeValue);
				OBSERVERS[observerName].disconnect();
				return void delete OBSERVERS[observerName];
			}

			if (targetNodeValue !== toNodeValue) {
				_setElementValue(toNode, targetNodeValue);
			}
		}
	}

	var observer = new MutationObserver(callback);
	observer.observe(targetNode, members);

	return observer;
}

module.exports = {
	/**
	 * @param {String} observerName
	 * @param {Element} targetNode
	 * @param {Element} toNode
	 * @param {Object=} config
	 */
	oneTime: function (observerName, targetNode, toNode, config) {
		OBSERVERS[observerName] = _initObserver(targetNode, toNode, config, 'oneTime', observerName);
	},

	/**
	 * @param {String} observerName
	 * @param {Element} targetNode
	 * @param {Element} toNode
	 * @param {Object=} config
	 */
	oneWay: function (observerName, targetNode, toNode, config) {
		OBSERVERS[observerName] = _initObserver(targetNode, toNode, config, 'oneWay');
	},

	/**
	 * @param {String} observerName
	 * @param {Element} targetNode
	 * @param {Element} toNode
	 * @param {Object=} config
	 */
	twoWay: function (observerName, targetNode, toNode, config) {
		OBSERVERS[observerName] = _initObserver(targetNode, toNode, config, 'twoWay');
		OBSERVERS[observerName + '_two_way'] = _initObserver(toNode, targetNode, config, 'twoWay');
	},

	/**
	 * @param {String} observerName
	 */
	disconnect: function (observerName) {
		OBSERVERS[observerName].disconnect();
		delete OBSERVERS[observerName];

		if (OBSERVERS[observerName + '_two_way']) {
			OBSERVERS[observerName + '_two_way'].disconnect();
			delete OBSERVERS[observerName + '_two_way'];
		}
	},

	disconnectAll: function () {
		for (var observer in OBSERVERS) {
			OBSERVERS[observer].disconnect();
			delete OBSERVERS[observer];
		}
	}
};
