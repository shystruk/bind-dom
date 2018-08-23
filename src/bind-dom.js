var OBSERVERS = {};
var nodeNameRegExp = /^INPUT|TEXTAREA/gi;

function _getElementValue(node) {
    if (node.nodeName.search(nodeNameRegExp) !== -1) {
        return node.value;
    }

    return node.textContent;
}

function _setElementValue(node, value) {
    if (node.nodeName.search(nodeNameRegExp) !== -1) {
        node.setAttribute('value', value);
    } else {
        node.innerHTML = value;
    }
}

function _initObserver(observerNode, toNode, config, type, observerName) {
    var members = (config && config.members) || { attributes: true, childList: true, subtree: true, characterData: true };
    var callback = (config && config.callback) || _callBack;

    function _callBack(mutationsList) {
        for (var i = 0; i < mutationsList.length; i++) {
            var observerNodeValue = _getElementValue(mutationsList[i].target);
            var toNodeValue = _getElementValue(toNode);

            if (type === 'oneTime') {
                _setElementValue(toNode, observerNodeValue);
                OBSERVERS[observerName].disconnect();
                delete OBSERVERS[observerName];
            }

            if (observerNodeValue !== toNodeValue) {
                _setElementValue(toNode, observerNodeValue);
            }
        }
    }

    var observer = new MutationObserver(callback);
    observer.observe(observerNode, members);

    return observer;
}

module.exports = {
    /**
     * @param {String} observerName
     * @param {Element} observerNode
     * @param {Element} toNode
     * @param {Object=} config
     */
    oneTime: function(observerName, observerNode, toNode, config) {
        OBSERVERS[observerName] = _initObserver(observerNode, toNode, config, 'oneTime', observerName);
    },

    /**
     * @param {String} observerName
     * @param {Element} observerNode
     * @param {Element} toNode
     * @param {Object=} config
     */
    oneWay: function(observerName, observerNode, toNode, config) {
        OBSERVERS[observerName] = _initObserver(observerNode, toNode, config, 'oneWay');
    },

    /**
     * @param {String} observerName
     * @param {Element} observerNode
     * @param {Element} toNode
     * @param {Object=} config
     */
    twoWay: function(observerName, observerNode, toNode, config) {
        OBSERVERS[observerName] = _initObserver(observerNode, toNode, config, 'twoWay');
        OBSERVERS[observerName + '_two_way'] = _initObserver(toNode, observerNode, config, 'twoWay');
    },

    /**
     * @param {String} observerName
     */
    disconnectBindDom: function(observerName) {
        OBSERVERS[observerName].disconnect();
        delete OBSERVERS[observerName];

        if (OBSERVERS[observerName + '_two_way']) {
            OBSERVERS[observerName + '_two_way'].disconnect();
            delete OBSERVERS[observerName + '_two_way'];
        }
    },

    disconnectBindDomAll: function() {
        for(var observer in OBSERVERS) {
            OBSERVERS[observer].disconnect();
            delete OBSERVERS[observer];
        }
    }
};
