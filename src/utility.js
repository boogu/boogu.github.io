import 'firebase'

export class Utility {
  constructor(){
  }

  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  copyAttributesWithoutChildren(newNode, node) {
    function copyAttributes(newNode, node, attrName) {
      if (typeof node[attrName] != "undefined") newNode[attrName] = node[attrName];
    }
    var attrList = ["collapsed", "content", "fold", "icon", "id", "create_time",
        "x", "y", "width", "height"];
    for (var i = 0; i < attrList.length; i++) {
      copyAttributes(newNode, node, attrList[i]);
    };
  }

  copyAttributes(newNode, node) {
    function copyAttributes(newNode, node, attrName) {
      if (typeof node[attrName] != "undefined") newNode[attrName] = node[attrName];
    }
    var attrList = ["collapsed", "content", "fold", "icon", "id", "create_time",
        "x", "y", "width", "height"];
    for (var i = 0; i < attrList.length; i++) {
      copyAttributes(newNode, node, attrList[i]);
    };

    newNode.children = [];
    for (var i = 0; node.children && i < node.children.length; i++) {
      newNode.children.push(node.children[i]);
    };
  }

  createNewNode() {
    return {
      id : this.getUniqueId(),
      content : "",
      collapsed : false,
      fold : false,
      icon : 0,
      children : []
    }
  }

  createNewFlatNode() {
    return {
      id : this.getUniqueId(),
      content : "",
      collapsed : false,
      fold : false,
      icon : 0,
      x:100,
      y:30,
      width:400,
      height:247,
      children : []
    }
  }

  getChildrenPosition(node, id) {
    for (var i = 0; i < node.children.length; i++) {
      if (node.children[i] == id) {
        return i;
      }
    };
  }

  getUniqueId() {
    function randomString(length, chars) {
      var result = '';
      for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      return result;
    }
    // TODO: Replace with Firebase.ServerValue.TIMESTAMP.
    // Add BN here to prevent the css selector error.
    return "BN-" + new Date().getTime().toString() + "-" + randomString(5, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  }

  getCleanChildren(node) {
    var children = [];
    for (var i = 0; node.children && i < node.children.length; i++) {
      children.push(node.children[i]);
    };
    return children;
  }

  initInteract(id, vm) {
    interact('#'+id)
      .allowFrom(".flat-titlebar")
      .draggable({
         onmove:   function dragMoveListener (event) {
            var target = event.target,
                // keep the dragged position in the data-x/data-y attributes
                x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            // translate the element
            target.style.webkitTransform =
            target.style.transform =
              'translate(' + x + 'px, ' + y + 'px)';

            // update the posiion attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
            vm.setPositionToRemoteServer(id);
          }
          // this is used later in the resizing demo
          // window.dragMoveListener = dragMoveListener;
      })
      
    interact('#'+id+" .flat-body")
      .resizable({
          edges: { left: true, right: true, bottom: true, top: false }
        })
      .on('resizemove', function (event) {
        var target = event.target.parentElement,
            x = (parseFloat(target.getAttribute('data-x')) || 0),
            y = (parseFloat(target.getAttribute('data-y')) || 0);

        // update the element's style
        target.style.width  = event.rect.width + 'px';
        target.style.height = event.rect.height + $('#'+id+' .flat-titlebar').height() + 'px';

        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;

        target.style.webkitTransform = target.style.transform =
            'translate(' + x + 'px,' + y + 'px)';

        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        // target.textContent = event.rect.width + '×' + event.rect.height;
        vm.setPositionToRemoteServer(id);
      });
  }

  isSameNode(node1, node2) {
    var attrList = ["collapsed", "content", "fold", "icon", "id", "create_time"];
    for (var i = 0; i < attrList.length; i++) {
      if (node1[attrList[i]] != node2[attrList[i]])
        return false;
    };

    if (!node1.children && !node2.children) return true;
    if (node1.children && !node2.children) return false;
    if (!node1.children && node2.children) return false;
    if (node1.children.length != node2.children.length) return false;

    for (var i = 0; i < node1.children.length; i++) {
      if (node1.children[i] != node2.children[i])
        return false;
    };

    return true;
  }

  listToTree(nodes, root_id) {
    var that = this;
    var visit = function(node_id) {
      var node = nodes[node_id];
      var newNode = new Object();
      that.copyAttributesWithoutChildren(newNode, node);
      newNode.children = [];
      for (var i = 0; i < node.children.length; i++) {
        newNode.children.push(visit(node.children[i]));
      };
      return newNode;
    }

    return visit(root_id);
  }

  treeToList(root) {
    var nodes = [];
    var that = this;
    var visit = function(node) {
      var newNode = new Object();
      newNode.children = [];
      that.copyAttributesWithoutChildren(newNode, node);
      for (var i = 0; i < node.children.length; i++) {
        newNode.children.push(visit(node.children[i]));
      };
      newNode.id = that.getUniqueId();
      nodes.push(newNode);
      return newNode.id;
    }

    var newRootId = visit(root);
    return {
      root_id: newRootId,
      nodes: nodes
    }

  }

  now() {
    return new Date().getTime();
  }
}