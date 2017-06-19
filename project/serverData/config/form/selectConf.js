/**
 * Created by xiyuan on 16-12-12.
 */
selectConf({
    name:'testName',
    search:true,
    // multiple:true,
    style:{
        width:'160px',
    },
    events:{
        change:function () {
            console.log(this,'yes')
        },
        click:function () {
            console.log('click')
        }
    },
    dataList:[
        {
            isGroup:true,
            label:'水果',
            list:[
                {
                    isGroup:false,
                    disabled:true,//是否不可以选择,默认false(即可选择)
                    content:'西瓜3213135112FFFFFFFFFFFFFFFFFFFFF32131',
                    value:'水果1',
                },
                {
                    isGroup:false,
                    disabled:true,
                    content:'橙子',
                    value:'水果2',
                },
                {
                    isGroup:false,
                    disabled:false,
                    content:'苹果',
                    value:'水果3',
                },
                {
                    isGroup:false,
                    disabled:false,
                    content:'山竹',
                    value:'水果4',
                },
            ]
        },
        {
            content:'衣服',
            value:'衣服',
            disabled:true,
        },
        {
            // isGroup:true,
            content:'饮料',
            value:'饮料',
            selected:true
        },
        {
            isGroup:true,
            content:'办公用品',
            list:[
                {
                    isGroup:false,
                    disabled:false,
                    content:'铅笔',
                    value:'办公用品1',
                },
                {
                    isGroup:false,
                    disabled:false,
                    content:'橡皮',
                    value:'办公用品2',
                },
                {
                    isGroup:false,
                    disabled:false,
                    content:'钢笔',
                    value:'办公用品3',
                },
                {
                    isGroup:false,
                    disabled:false,
                    content:'尺子',
                    value:'办公用品4'
                },
                {
                    "content": "--请选择--",
                    "value": "-1",
                    "selected": true
                },
                {
                    "content": "设置",
                    "value": "SETTING"
                },
                {
                    "content": "客户",
                    "value": "CUSTOMER"
                },
                {
                    "content": "呼叫记录",
                    "value": "CALL_HISTORY"
                },
                {
                    "content": "任务",
                    "value": "TASK"
                },
                {
                    "content": "跟进",
                    "value": "FOLLOW_UP"
                },
                {
                    "content": "回访",
                    "value": "RETURN_VISIT"
                },
                {
                    "content": "问卷",
                    "value": "QUESTIONNAIRE"
                },
                {
                    "content": "知识库",
                    "value": "KNOWLEDGE_BASE"
                },
                {
                    "content": "任务明细",
                    "value": "TASK_DETAIL"
                },
                {
                    "content": "问卷明细",
                    "value": "QUESTIONNAIRE_DETAIL"
                },
                {
                    "content": "省",
                    "value": "PROVINCE"
                },
                {
                    "content": "市",
                    "value": "CITY"
                },
                {
                    "content": "区",
                    "value": "AREA"
                },
                {
                    "content": "分机监控",
                    "value": "MONITORING"
                },
                {
                    "content": "问卷答案",
                    "value": "QUESTIONNAIRE_ANSWER"
                },
                {
                    "content": "报表",
                    "value": "REPORT_BIMBO"
                },
                {
                    "content": "合同",
                    "value": "OPERATING_THE_CONTRACT"
                },
                {
                    "content": "供应商",
                    "value": "SUPPLIER"
                },
                {
                    "content": "产品",
                    "value": "PRODUCT"
                },
                {
                    "content": "积分产品",
                    "value": "INTEGRAL_PRODUCTS"
                },
                {
                    "content": "积分管理",
                    "value": "INTEGR_MANAGEMENT"
                },
                {
                    "content": "积分规则",
                    "value": "INTEGRAL_RULES"
                },
                {
                    "content": "活动管理",
                    "value": "ACTIVITYMANAGEMENT"
                },
                {
                    "content": "OA工作流",
                    "value": "OA_WORKFLOW"
                },
                {
                    "content": "流程编辑",
                    "value": "PROCESS_EDITOR"
                },
                {
                    "content": "审核界面",
                    "value": "REVIEW_INTERFACE"
                },
                {
                    "content": "积分订单",
                    "value": "INTEGRAL_ORDER2"
                },
                {
                    "content": "工作流程控制2",
                    "value": "ACTIVITY"
                },
                {
                    "content": "积分订单明细",
                    "value": "GIFT_DETIAL"
                },
                {
                    "content": "邀客",
                    "value": "INVITED_GUEST"
                },
                {
                    "content": "供应商合同",
                    "value": "SUPPLIER_CONTRACT"
                },
                {
                    "content": "项目参数",
                    "value": "PROJECT_PARAMETER"
                },
                {
                    "content": "销售预测",
                    "value": "SALES_FORECAST"
                },
                {
                    "content": "流程配置管理",
                    "value": "PROCESS_MANAGE"
                },
                {
                    "content": "奖金系数",
                    "value": "BONUSFACTOR"
                },
                {
                    "content": "供应商_2",
                    "value": "DEMO_SUP"
                },
                {
                    "content": "销售管理",
                    "value": "SALES_MANAGEMENT"
                },
                {
                    "content": "产品销售记入表",
                    "value": "PRODUCT_SALES"
                },
                {
                    "content": "员工绩效佣金",
                    "value": "EMPLOYEE_COMMISSION"
                },
                {
                    "content": "部门季度奖金",
                    "value": "DEPART_BONUS"
                },
                {
                    "content": "销售分析报表",
                    "value": "SALES_ANALYSIS"
                },
                {
                    "content": "金海棠报表",
                    "value": "TJ_REPORT"
                },
                {
                    "content": "用户统计权限",
                    "value": "REP_FLAG"
                },
                {
                    "content": "部门绩效参数",
                    "value": "DEPT_PARA"
                },
                {
                    "content": "部门指标",
                    "value": "DEPT_TAR"
                },
                {
                    "content": "后端业绩分成参数",
                    "value": "FC_PRAM"
                },
                {
                    "content": "渠道订单",
                    "value": "CHA_ORDER"
                },
                {
                    "content": "利润产品系数对照表",
                    "value": "RATE_P"
                },
                {
                    "content": "会员合同",
                    "value": "HYHT"
                },
                {
                    "content": "海棠客户",
                    "value": "HTKH"
                },
                {
                    "content": "海棠会员",
                    "value": "HTMEMBER"
                },
                {
                    "content": "募集管理",
                    "value": "FUNDS"
                },
                {
                    "content": "产品信息",
                    "value": "NPRODUCT"
                },
                {
                    "content": "产品分类",
                    "value": "NPRODCAT"
                },
                {
                    "content": "折标率类型",
                    "value": "NDISTYPE"
                },
                {
                    "content": "产品价格规则明细表",
                    "value": "NPPRULE"
                },
                {
                    "content": "折标率信息表",
                    "value": "NDISINFO"
                },
                {
                    "content": "汇款明细",
                    "value": "HKUANMX"
                },
                {
                    "content": "业务员管理",
                    "value": "YEWUYGL"
                },
                {
                    "content": "触发器",
                    "value": "CHUFAQI1"
                },
                {
                    "content": "报表管理",
                    "value": "BAOBIAOGL"
                },
                {
                    "content": "财务导出",
                    "value": "CAIWUDC"
                },
                {
                    "content": "业绩管理",
                    "value": "MANAGED"
                },
                {
                    "content": "232142134",
                    "value": "221342134"
                }
            ]
        }

    ]
});