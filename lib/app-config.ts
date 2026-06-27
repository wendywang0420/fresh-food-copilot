export const appConfig = {
  name: "Fresh Food Brief-to-Concept Copilot",
  routePath: "/lesleyrnd",
  badge: "Public beta",
  headline: "Turn a customer brief into broad, commercially useful fresh food concepts.",
  subheadline:
    "Built for prepared-food ideation across salads, sandwiches, burgers, sushi, wraps, bowls, snack boxes, and adjacent fresh formats.",
  storageKey: "fresh-food-copilot-session-v1",
  messagesKey: "fresh-food-copilot-messages-v1",
  chatModelKey: "fresh-food-copilot-chat-model-v1",
  researchModelKey: "fresh-food-copilot-research-model-v1",
  adminViewKey: "fresh-food-copilot-admin-view-v1",
  activeStreamKey: "fresh-food-copilot-active-stream-v1",
  lastFailureKey: "fresh-food-copilot-last-failure-v1",
  starterPrompts: [
    "请基于一份便利店夏季午餐 brief，提出兼顾高颜值和操作简洁度的沙拉与卷饼方向。",
    "请围绕都市白领早餐场景，提出适合冷藏陈列的三明治与饭团概念，强调高复购。",
    "请根据会员超市熟食区需求，提出兼顾家庭分享与单人午餐的 ready-to-heat 新品方向。",
  ],
  principleCards: [
    {
      title: "Brief first",
      body: "把客户 brief 当作第一优先级，再用趋势和创意扩展空间，而不是偏离任务本身。",
    },
    {
      title: "Commercially grounded",
      body: "每个概念都需要好命名、好卖点、好落地，不只停留在灵感层面。",
    },
    {
      title: "Public workspace",
      body: "这是公开页面。不要提交保密、专有或尚未获准分享的客户资料。",
    },
  ],
} as const;
