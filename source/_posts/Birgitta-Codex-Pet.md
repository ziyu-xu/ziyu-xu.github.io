---
title: 薇尔琪塔CodeX宠物（GPT生成的）
date: 2026-08-06 18:00:00
tags: Gadgets
---

伊涅芙的薇尔琪塔小机器人 Codex Pet，现在将它作为非商业同人资源分享出来。

<!--more-->

它是一只适用于 Codex 的 v2 动画宠物，包含待机、移动、挥手、跳跃、等待、工作和审阅等状态，以及 16 个视线方向。

本来想做成更2D，像素风的，但是给了prompt做了一个半小时之后还是做成了这种3D风格，不过感觉也不差。


## 下载

[下载 Birgitta Codex Pet v1.0.0](https://github.com/ziyu-xu/ziyu-xu.github.io/releases/download/birgitta-pet-v1.0.0/birgitta-codex-pet-v1.0.0.zip)

文件大小约 2.4 MB。SHA-256：

```text
490382549c4f32ef2c3c6901f59a5a9c609ec00dc123faeed9e36924b5a41990
```

压缩包内包含：

```text
birgitta/
├── pet.json
├── spritesheet.webp
├── README.md
└── THIRD_PARTY_NOTICES.md
```

## 安装方法

### 1. 下载并解压

点击上方链接下载压缩包。解压后应得到一个名为 `birgitta` 的文件夹，请确认 `pet.json` 和 `spritesheet.webp` 位于该文件夹的第一层。

### 2. 安装到 Codex Pets 目录

在 macOS 的 Terminal 中运行：

```bash
mkdir -p ~/.codex/pets
cp -R ~/Downloads/birgitta ~/.codex/pets/
```

如果浏览器将文件解压到了其他位置，请将命令中的 `~/Downloads/birgitta` 换成实际路径。也可以在 Finder 中按下 `Command + Shift + G`，输入：

```text
~/.codex/pets
```

然后手动将整个 `birgitta` 文件夹拖入该目录。

正确安装后的结构应为：

```text
~/.codex/pets/birgitta/pet.json
~/.codex/pets/birgitta/spritesheet.webp
```

### 3. 启用

完全退出并重新打开 Codex，然后在 Codex Pets 的宠物选择界面中选择 **Birgitta**。如果没有出现，请重新检查目录名称和文件层级，避免形成 `birgitta/birgitta/` 两层嵌套。

### 4. 卸载

退出 Codex，然后删除下面的文件夹即可：

```text
~/.codex/pets/birgitta
```

## 使用范围与版权声明

Birgitta Codex Pet 是基于《原神》已经公开的 Birgitta 机器人设计制作的非商业同人作品，与 HoYoverse、COGNOSPHERE、米哈游及 OpenAI 均无官方关联，也未获得上述主体的官方认可或赞助。

本资源仅供个人、非商业用途。请勿销售、付费分发、用于商业宣传，或以任何方式暗示它是官方产品或官方合作内容。请勿将资源中的图像单独标注为 MIT、CC0 或其他会授予商业使用权及再许可权的开放许可证。相关权利方如提出移除要求，本资源可能停止分发。

《原神》及 Birgitta 相关设计的知识产权归其相应权利人所有：

> © All rights reserved by COGNOSPHERE. Other properties belong to their respective owners.

Codex、ChatGPT 和 OpenAI 的名称及相关标识归其相应权利人所有。本资源不包含《原神》游戏程序，不是针对《原神》的插件、模组或更新程序。

下载、安装或继续使用本资源，即表示你理解以上说明。若你需要用于商业项目，请先自行取得相关权利人的书面许可。

上述内容仅用于说明本资源的发布和使用范围，不构成法律意见，也不代表发布者可以替相关权利人授予许可。

## 内容协作声明

本文的结构、安装说明及部分文字由 **ChatGPT** 协助撰写，最终内容由 我审核和发布。宠物的创意选择、制作与发布决定由我完成。

## 问题反馈

（其实我也完全不懂任何东西，所以问我不如问一问你的GPT吧）
