# Architecture

## Code repository structure

```
+ src
  + common  (common definitions)
  + component
    - DebugMain.svelte  (debug page component)
    - IntroPage.svelte  (intro page component)
    - Main.svelte
  + jit  (JIT for compiling input YAML to SevenMachineProgram)
  + seven  (@bctnry/seven related definitions)
    - component  (custom instructions for the SevenMachine)
    - Machine.ts  (SevenMachine definition)
    - SevenComponentIndex.ts  
    
  + utils  (utilities and auxiliary function)
  - App.svelte  (the main svelte component)
  - main.ts  (main entry)
```

## 关于Csárdás Lite

Csárdás Lite是由Csárdás分化出来的学习系统，目的是用于简短的turtorial式教学。

## 整体设计

+ 目前Csardas是一个具备多种「教学模式」的系统。（计划）支持的模式大致列举如下：
  - 对话模式：类似于surfer的对话模式。
  - 信息模式：类似于clewordplus的信息资源
  
## 前端路由

+ `/`：主页
+ `/#/Main`: 主系统
+ `/#/Debug`: 带mock editor的主系统；参照「Mock editor」一节

## SevenMachine Component

所有带`(pause)`的指令机器执行后都会暂停，需要使用`MACHINE.step()`继续。

+ `MODE`(modeType: string)
  - TableOfContents modeType=`'toc'`
    + `TOC_BG_COLOR`(color: string)
    + `TOC_BG_IMG`(url: string)
    + (pause) `TOC_SET_DATA`(data: {title: string, description?: string, targetFileName: string}[])

  - `CONVERSATIONAL` （modeType="conversation"）
    + `CONV_CLEAR`()
    + (pause) `CONV_HEADER`(level: number, text: string)
    + (pause) `CONV_NARRATOR`(text: string)
    + (pause) `CONV_TEXT`(name: string, iconUrl: string, position?: string, text: string)
      - `_order: number`: The order of phrase. When the order is bigger than 0, the name of the character will not be displayed.
    + `CONV_SET_MODE`(mode: Mode)
      - `type Mode = 'fullview' | 'chatbox'`
    + `CONV_SET_ANCHOR`(anchor: Anchor)
      - `type Anchor = (TOP_LEFT)1 | (TOP_RIGHT)2 | (BOTTOM_LEFT)3 | (BOTTOM_RIGHT)4'
    + (pause) `CONV_BRANCH`(branchList: {text: string, target: number}[])
    + `CONV_SET_BG`(type: string, url: string)
    + `CONV_SET_CHAR`(characterDict: {[name: string]: ConversationCharacterDescriptor})
      - ``` typescript
        type ConversationCharacterDescriptor = {
            name: string,
            // default icon.
            iconUrl: string,
            // icon for other emotions.
            iconDict: {[emotion: string]: string},
            position?: 'left'|'right'
        }
        ```
    + `CONV_SET_HALFVIEW`
      - `CONV_SET_HALFVIEW`(type: 'iframe'|'image', url: string)
      - `CONV_SET_HALFVIEW`(type: 'color', color: string)
    + (pause?) `CONV_SEND_MSG`(data: any, stopAfterSend: boolean = false)
      - send iframe message to halfview/background iframe.
      - 注意：机器是否停止取决于`stopAfterSend`
  - `info`（modeType="info")
    + (pause) `INFO_LOAD`(pageList: {content: string, format?: string, bg_url?: string, bg_color?: string}[])
    + `INFO_GOTO`(pageIndex: number)
    + `INFO_ADD`(page: {content: string, format?: string, bg_url?: string, bg_color?: string}, index?: number)
    <!-- + `INFO_CHANGE`(pageIndex: number, page: {content: string, format?: string, bgurl?: string}) -->
    + `INFO_DELETE`(pageIndex: number)
    + `INFO_PREV`()
    + `INFO_NEXT`()
  - `SEGUE`（modeType="segue"）
    + (pause) `SEGUE_SET`(title?: string, topTitle?: string, bgColor?: string, bgImage?: string, description?: string)
+ Timing
  - `WAIT`(ms: number)
+ Common
  - `TITLE`(title: string)
  - `DESCRIPTION`(description: string)
  - `ERROR`(message: string, header?: string)
  - `LISTEN`(name: string, callback: any)
  - (pause) `PAUSE`()
    + Stop machine from executing further & wait for component to manually step forward.
  - (pause) `LOAD`(data: data)
  - (pause) `LOAD_FILE`(fileName: string)


## 数据流向

+ 数据最开始是yaml。目前（2021.5.7）数据的metadata都是通过iframe message传入；传入的load message（详情参照clepub相关代码）中会包含clepub自己经过(1)从git repo读入后(2)经过yaml->json+schema check后的对象。这个对象只会包含schema中有描述到的部分（weird design but okay）。
+ JIT（`src/jit`）将传入的对象即时编译成seven program。
+ seven program对各处的svelte store进行操作。
+ store变动会通知有subscribe的控件，控件因此进行对应的变动。

csardas跟先前风变所有的教学系统都不一样，它的底层逻辑基于命令式的[Seven](https://sebastian.graphics/projects/seven.html)；这是为了能够更好地将精细控制暴露给课程的开发者。

## Mock editor

为了方便debug，在mock添加了mock editor功能，用于直接加载单个（不带schema描述）的yaml文档。（本地开发时打开`[本地地址]/#/mock/Machine`。）

+ 按Shift+E打开editor。
+ 按左上角的Load加载文档；效果相当于clepub load指令。
+ 右上角的圆圈可以按住拖动。

## 指定系统版本

系统版本一般需要在`project.json`的`system`字段指定：

``` json
// ...
"system": {
  "name": "Csardas",
  "url": "[csardas url]",
  // major version.
  "version": 0
}
```

这会成为文档在缺少`system_version`指定时的默认使用版本。

### `raw_main`

`raw_main`是在schema出现奇妙错误又急着需要继续工作时所使用的key name。内容就是`main`的内容的字符串形态，例如：

``` yaml
main:
  - info:
      contents:
        - content: |
            page 1
            page 1
            page 1
        - content: |
            page 2
            page 2
            page 2
  # ...
```

使用`raw_main`：

``` yaml
raw_main: |
  - info:
      contents:
        - content: |
            page 1
            page 1
            page 1
        - content: |
            page 2
            page 2
            page 2
  # ...
```

`main`的优先级高于`raw_main`。当`main`和`raw_main`同时存在时，`raw_main`将会被忽略。

## 独立模式组件

请参考docs/standalone.md。

## Notes

+ 目前（2021.4.30）surfer和blackboard都在用相关的库直接访问git repo，clepub会将相关的信息通过iframe message传入系统，因此storytime不是必须的（blackboard也没有用storytime）。
+ 目前（2021.4.30）使用svelte-spa-router。
+ 请尽量使用svelte自有store。如实在有必要，使用rxjs。**本项目严禁使用Redux以及各种Redux衍生物**。
+ “记录”有两种：一种是user trace，一种是machine state。先前的系统**认为**必须要从user trace计算出用户最后的machine state；这是错误的。machine state完全可以单独存储，与user trace没有任何关系。
