-   @ques 如何更新数据 + 如何提取更新

    -   能不能将修改的 entity 放到数组中
    -   同时 entity 修改的 component 也放到特定的数组中...
    -   @ques 能不能监听到 component 中的特定的属性变化

## 2019-04-10 14:13:13

-   @ques 如何监听数据更新..

*   @ques 如何组织

*   @ques 如何更新数据

*   @todo 可以将这转化为 ts

*   删除 export default

*   @ques 参考 test

*   他这 component 只是对象

    -   如何保证复用...

-   本地 ECS 继承 中用来创建 system entity
    -   ECS -> entity -> component -> ( 属性...)
    -   create remove update
    -   component -> ( 属性...) 有必要存在吗...

## 2019-04-10 10:38:53

-   @todo 清理

```ts
ECS.Entity = Entity;
ECS.System = System;
ECS.uid = uid;
```

-   @ques UID.UIDGenerator 能不能删除
-   @ques UID.DefaultUIDGenerator 在什么地方引用
-   @ques UID.isSaltedBy 是做什么的

*   @ques addToECS 没有地方调用

-   @ques 这个地方也是通过 enity updateComponent 更新数据

    -   如果这样 system 还有什么用吗...

-   entitiesSystemsDirty 能不能做成私有的
