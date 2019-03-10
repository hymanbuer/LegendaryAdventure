# 资源配置管理

资源配置，是指使用唯一id索引对应的资源，一个id可以对应多个资源。
资源配置的目的是，方便代码中使用对应的逻辑资源，并统一管理以便检测。
此外，若需实现多语言，只要为不同语言建一个配置表即可。

主要实现功能：
- 创建新的配置表
- 保存配置表
- 打开配置表
- 启动默认打开上一次编辑的配置表

- 显示配置表
- 新建配置项
- 删除配置项
- 编辑配置项
- 搜索配置项

## 生成规则
- 同一文件夹下，相同名字的资源合为一项，使用同一id索引
- 相同url的资源，按一定优先级排序
- 如果是子资源（只有SpriteFrame一种），如果父资源是auto-atlas则不自动添加父资源；
  如果是texture则自动添加或合并

## TODO:
- refresh
- watch asset changing

// assets-config.json
{
    "version": "0.0.1",
    "name": "assets-config",
    "assets": {
        "common.xx.ss": [
            {"uuid": "fjjfjjjjakfjskdfj", "type": "cc.Texture2D"},
            {"uuid": "fjjfjjjjfakjskdfj", "type": "cc.SpriteFrame"},
        ]
    }
}