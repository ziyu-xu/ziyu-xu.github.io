---
title: Upload images to hexo-based github.io portfolio
date: 2024-08-21 17:32:05
tags: Tutorials
---

# Aim

To upload images to my portfolio which is constructed by hexo-based github.io.

<!--more-->

# Procedure

## 1 Install plugins

Install ```hexo-asset-image``` plugin

```npm install hexo-asset-image --save```



Install ```hexo-renderer-marked``` plugin

```npm install hexo-renderer-marked --save```

Edit ```_config.yml```

```
post_asset_folder: true
marked:
 prependRoot: true
 postAsset: false
```

The "postAsset: false" is important due to the redundancy of generated absolute image path.

## 2 Insert image

With ```hexo-asset-image``` plugin installed we make a new post:

```hexo new "project name"```

A new directory is automatically generated 

![Illustration of new generated directory](image-20240821215244435.png)

Now we insert an image to the markdown: For instance:

![Screenshot of Furina](image-20240821215454491.png)

Then delete all strings before '/'. Now the image is invisible in Typora.

![Furina](115292447_p0-17242485245562.jpg)

## 3 Insert image with specific width and captions

We note that the Furina image above is too wide. To regulate the image width, previous command to insert image is replaced by following commands:

```
<figure>
    <img src="(your png/jpg path)" alt="title" width="60%"/> // or width="500" to specify the width
    <figcaption>your title</figcaption>
</figure>
```

Now the command is applied to upload a 60% Furina:

<figure>
    <img src="115292447_p0-17242485245562.jpg" alt="Furina" width="60%"/>
    <figcaption>Furina</figcaption>
</figure>

Then perform ```hexo clean``` ```hexo generate``` and ```hexo server``` to inspect the insertion of images.

### pixiv id

115292447
