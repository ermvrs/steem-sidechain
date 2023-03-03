// Çağrıları tree şeklinde tasarlayacağız. revert döngüsü doğru çalışmalı

export const createRoot = function() {
    return {
        id : 0,
        changes : [],
        children : [],
        parent : -1,
    };
}

export const addChild = function(leave) {
    console.log(leave)
    if(leave.children.length > 0) {
        leave.children = [...leave.children, {
            id : leave.id + 1, changes : [], children : [], parent : leave.id
        }];
    } else {
        leave.children = [{
            id : leave.id + 1, changes : [], children : [], parent : leave.id
        }];
    }

    return leave.children[leave.children.length -1];
}

export const addChangeToChild = function(leave, change) {
    leave.changes = [...leave.changes, change];
    return leave;
}

export const rollBackChilds = async function (leave) {
    // will roll back all childs after this parent.
    console.log("starting roll back")
    console.log(JSON.stringify(leave))

    // TODO sondan başa revert atmalı

    // CALL TRACE DOĞRUMU KONTROL
}

function findLastChild(tree) {
    let lastChild;
    let found = false;
    let current = tree;
    while(!found) {
    
    }
}