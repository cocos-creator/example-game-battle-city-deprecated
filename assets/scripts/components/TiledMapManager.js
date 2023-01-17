// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var NodePoolManager = require("./NodePoolManager");
var GameEnum = require("../gameData/GameEnum");
var GameConst = require("../gameData/GameConst");
cc.Class({
    extends: cc.Component,

    properties: {
        mainTiledMap: {
            default: null,
            type: cc.TiledMap
        },

        tiledMapAssetSet: {
            default: [],
            type: cc.TiledMapAsset
        },

        tiledMapAssets: {
            default: [],
            type: cc.TiledMapAsset
        },
        _interimPos:[],

    },

    start () {
        this.initTiledMapData();
    },

    initTiledMapData () {
        this.mainLayer = this.mainTiledMap.getLayer("layer_0");
        this.secondaryLayer = this.mainTiledMap.getLayer("layer_1");
    },

    onTileMovedEvent (tileNode, callback) {
        if (tileNode.getComponent("TankManager") && !tileNode.getComponent("TankManager").isCanMove) {
            return;
        }
        var startPos = cc.v2(tileNode.position.x, tileNode.position.y);
        var tankDirection = null;
        if (!tileNode.getComponent("TankManager")) {
            tankDirection = tileNode._direction;
        }
        else {
            tankDirection = tileNode.getComponent("TankManager").tankDirection;
        }
        if (tankDirection === GameConst.Dirction[0]) {
            startPos.y += tileNode.height;
        }
        else if(tankDirection === GameConst.Dirction[2]){
            startPos.y -= tileNode.height;
        }
        else if (tankDirection === GameConst.Dirction[1]) {
            startPos.x -= tileNode.width;
        }
        else if (tankDirection === GameConst.Dirction[3]) {
            startPos.x += tileNode.width;
        }
        var tilePos = this.getTilePositionAt(tileNode, startPos);
        
        if (tilePos.y <= this.mainLayer.getLayerSize().height - 1 && tilePos.x <= this.mainLayer.getLayerSize().width - 1
         && tilePos.y >= 0 && tilePos.x >= 0) {
            //  console.log("cocos");
            var tileGID = this.mainLayer.getTileGIDAt(tilePos);
            if (GameConst.GidToTileType[tileGID] === GameEnum.TileType.tileWall) {
                //tankBullet
                if (tileNode.group === cc.game.groupList[1] || tileNode.group === cc.game.groupList[4]) {
                    this.mainLayer.setTileGIDAt(0, tilePos.x, tilePos.y);
                    NodePoolManager.putNodeElemenet(tileNode.group, tileNode);
                }
                //tank
                else if (tileNode.group === cc.game.groupList[2] || tileNode.group === cc.game.groupList[3]) {
                    return false;
                }
            }
            else if (GameConst.GidToTileType[tileGID] === GameEnum.TileType.tileSteel) {
                if (tileNode.group === cc.game.groupList[1] || tileNode.group === cc.game.groupList[4]) {
                    cc.find("Canvas").getComponent("SoundManager").playEffectSound("steel", false);
                    NodePoolManager.putNodeElemenet(tileNode.group, tileNode);
                }
                //tank
                else if (tileNode.group === cc.game.groupList[2] || tileNode.group === cc.game.groupList[3]) {
                    return false;
                }
            }
            else if (GameConst.GidToTileType[tileGID] === GameEnum.TileType.tileRiver) {
                if (tileNode.group === cc.game.groupList[2] || tileNode.group === cc.game.groupList[3]) {
                    return false;
                }
            }
            else if (GameConst.GidToTileType[tileGID] === GameEnum.TileType.tileKing) {
                if (tileNode.group === cc.game.groupList[1] || tileNode.group === cc.game.groupList[4]) {
                    cc.find("Canvas").getComponent("Game").onGameOverEvent();
                    NodePoolManager.putNodeElemenet(tileNode.group, tileNode);
                }
                //tank
                else if (tileNode.group === cc.game.groupList[2] || tileNode.group === cc.game.groupList[3]) {
                    return false;
                }
            }
            tileNode.position = startPos;
            if (typeof callback === "function") {
                callback();
            }
            return tileNode;
        }
        else {
            return false;
        }
    },

    getTilePositionAt (tileNode, position) {
        var worldPosition = tileNode.parent.convertToWorldSpaceAR(position);
        var mapSize = this.node.getContentSize();
        var tileSize = this.mainTiledMap.getTileSize();
        var x = Math.floor(worldPosition.x / tileSize.width);
        var y = Math.floor((mapSize.height - worldPosition.y) / tileSize.height);
        return cc.v2(x, y);
    },

    // update (dt) {},
});
