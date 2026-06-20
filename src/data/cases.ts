import type { Level, CaseData } from '@/types'

export const levels: Level[] = [
  {
    id: 'caries',
    title: '龋坏邻面片',
    description: '识别邻面龋的影像特征，准确描述龋坏范围与牙位，区分浅龋、中龋与深龋',
    icon: 'ScanEye',
    order: 1,
  },
  {
    id: 'periapical',
    title: '根尖周病',
    description: '观察根尖区透射影或阻射影，判断根尖周炎类型与范围，识别根尖囊肿与肉芽肿',
    icon: 'Crosshair',
    order: 2,
  },
  {
    id: 'impacted',
    title: '阻生智齿',
    description: '判断阻生齿的位置与角度分类，评估与邻牙关系及神经管距离，描述根尖形态',
    icon: 'GitBranch',
    order: 3,
  },
  {
    id: 'periodontal',
    title: '牙周骨吸收',
    description: '评估牙槽骨吸收程度与类型，区分水平吸收与垂直吸收，判断根分叉病变',
    icon: 'Activity',
    order: 4,
  },
]

export const cases: CaseData[] = [
  {
    id: 'caries-1',
    levelId: 'caries',
    title: '病例1：上颌磨牙邻面龋',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dental%20x-ray%20radiograph%20showing%20interproximal%20caries%20on%20maxillary%20molar%20dark%20shadow%20between%20teeth%20clinical%20dental%20imaging%20black%20background&image_size=landscape_4_3',
    chiefComplaint: '右上方后牙遇冷热酸痛一周',
    patientInfo: '女，32岁，体健',
    standardAnswer: {
      toothPosition: '16远中邻面',
      imagingFindings: '16远中邻面可见低密度透射影，达牙本质浅层，未及髓腔，边缘不清晰，远中釉质板连续性中断',
      preliminaryJudgment: '16远中邻面龋（中龋）',
      suggestedTreatment: '16去龋备洞后树脂充填修复，建议拍摄咬翼片复查',
      keywords: {
        toothPosition: ['16', '远中', '邻面'],
        imagingFindings: ['低密度透射影', '牙本质浅层', '未及髓腔', '边缘不清晰', '釉质板中断'],
        preliminaryJudgment: ['16', '远中邻面龋', '中龋'],
        suggestedTreatment: ['去龋备洞', '树脂充填', '咬翼片复查'],
      },
    },
  },
  {
    id: 'caries-2',
    levelId: 'caries',
    title: '病例2：下颌前磨牙邻面深龋',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dental%20x-ray%20radiograph%20showing%20deep%20interproximal%20caries%20on%20mandibular%20premolar%20close%20to%20pulp%20chamber%20dark%20radiolucency%20clinical%20dental%20imaging%20black%20background&image_size=landscape_4_3',
    chiefComplaint: '左下后牙自发性疼痛三天',
    patientInfo: '男，45岁，高血压服药中',
    standardAnswer: {
      toothPosition: '35近中邻面',
      imagingFindings: '35近中邻面可见较大面积低密度透射影，达牙本质深层，近髓腔，根尖周未见明显异常',
      preliminaryJudgment: '35近中邻面深龋，不排除可复性牙髓炎可能',
      suggestedTreatment: '35试保留活髓行间接盖髓术+树脂充填，若术中露髓则改行根管治疗，建议拍摄根尖片随访',
      keywords: {
        toothPosition: ['35', '近中', '邻面'],
        imagingFindings: ['低密度透射影', '牙本质深层', '近髓腔', '根尖周无异常'],
        preliminaryJudgment: ['35', '深龋', '可复性牙髓炎'],
        suggestedTreatment: ['间接盖髓术', '树脂充填', '根管治疗', '根尖片随访'],
      },
    },
  },
  {
    id: 'caries-3',
    levelId: 'caries',
    title: '病例3：下颌磨牙继发龋',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dental%20x-ray%20radiograph%20showing%20secondary%20recurrent%20caries%20under%20existing%20filling%20on%20mandibular%20molar%20radiolucent%20shadow%20beneath%20restoration%20clinical%20dental%20imaging%20black%20background&image_size=landscape_4_3',
    chiefComplaint: '右下后牙充填物脱落伴食物嵌塞两周',
    patientInfo: '男，58岁，糖尿病控制中',
    standardAnswer: {
      toothPosition: '46咬合面及近中邻面',
      imagingFindings: '46可见原充填体影像，其下方及近中邻面可见低密度透射影，充填体边缘不密合，龋坏范围达牙本质中层',
      preliminaryJudgment: '46继发龋（中龋），原充填体失败',
      suggestedTreatment: '46去除原充填体及继发龋后重新树脂充填修复，必要时垫底',
      keywords: {
        toothPosition: ['46', '咬合面', '近中', '邻面'],
        imagingFindings: ['充填体影像', '低密度透射影', '边缘不密合', '牙本质中层'],
        preliminaryJudgment: ['46', '继发龋', '中龋', '充填体失败'],
        suggestedTreatment: ['去除原充填体', '树脂充填', '垫底'],
      },
    },
  },
  {
    id: 'periapical-1',
    levelId: 'periapical',
    title: '病例1：前牙根尖周炎',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dental%20x-ray%20periapical%20radiograph%20showing%20periapical%20radiolucency%20at%20anterior%20tooth%20root%20apex%20well-defined%20lucency%20clinical%20dental%20imaging%20black%20background&image_size=landscape_4_3',
    chiefComplaint: '上前牙咬合痛伴牙龈起脓包一月',
    patientInfo: '女，28岁，既往上前牙外伤史',
    standardAnswer: {
      toothPosition: '21根尖区',
      imagingFindings: '21根尖区可见类圆形低密度透射影，边界清晰，约5mm×6mm大小，根管影像模糊，牙冠颜色灰暗',
      preliminaryJudgment: '21根尖周肉芽肿，慢性根尖周炎',
      suggestedTreatment: '21行根管治疗术，术后随访观察根尖病变愈合情况，若6个月后病变无缩小则考虑根尖手术',
      keywords: {
        toothPosition: ['21', '根尖区'],
        imagingFindings: ['低密度透射影', '边界清晰', '类圆形', '根管影像模糊', '牙冠灰暗'],
        preliminaryJudgment: ['21', '根尖周肉芽肿', '慢性根尖周炎'],
        suggestedTreatment: ['根管治疗术', '随访观察', '根尖手术'],
      },
    },
  },
  {
    id: 'periapical-2',
    levelId: 'periapical',
    title: '病例2：磨牙根尖囊肿',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dental%20x-ray%20periapical%20radiograph%20showing%20large%20periapical%20cyst%20at%20mandibular%20molar%20root%20apex%20well-circumscribed%20radiolucency%20with%20cortical%20border%20clinical%20dental%20imaging%20black%20background&image_size=landscape_4_3',
    chiefComplaint: '左下后牙反复肿痛半年，近一周加重',
    patientInfo: '男，52岁，吸烟史',
    standardAnswer: {
      toothPosition: '36根尖区',
      imagingFindings: '36根尖区可见较大椭圆形低密度透射影，约10mm×12mm，边界清晰，可见皮质白线，远中根管充填影像不完整',
      preliminaryJudgment: '36根尖囊肿，原根管治疗不完善',
      suggestedTreatment: '36行根管再治疗，若根管再治疗后病变未愈合则行根尖切除术+根尖倒充填术',
      keywords: {
        toothPosition: ['36', '根尖区'],
        imagingFindings: ['椭圆形低密度透射影', '边界清晰', '皮质白线', '根管充填不完整'],
        preliminaryJudgment: ['36', '根尖囊肿', '根管治疗不完善'],
        suggestedTreatment: ['根管再治疗', '根尖切除术', '根尖倒充填'],
      },
    },
  },
  {
    id: 'periapical-3',
    levelId: 'periapical',
    title: '病例3：磨牙根分叉病变',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dental%20x-ray%20periapical%20radiograph%20showing%20furcation%20involvement%20on%20maxillary%20molar%20radiolucency%20between%20roots%20clinical%20dental%20imaging%20black%20background&image_size=landscape_4_3',
    chiefComplaint: '右上后牙咬合无力伴松动三月',
    patientInfo: '女，60岁，牙周病史',
    standardAnswer: {
      toothPosition: '16根分叉区',
      imagingFindings: '16根分叉区可见低密度透射影，根分叉区骨嵴消失，颊侧及腭侧牙槽骨吸收至根中1/3，近颊根根尖区亦见小范围透射影',
      preliminaryJudgment: '16根分叉病变（III度），合并根尖周炎',
      suggestedTreatment: '16先行根管治疗，评估牙周-牙髓联合病变预后，若松动持续加重建议拔除后种植修复',
      keywords: {
        toothPosition: ['16', '根分叉区'],
        imagingFindings: ['低密度透射影', '骨嵴消失', '牙槽骨吸收', '根中1/3', '根尖透射影'],
        preliminaryJudgment: ['16', '根分叉病变', 'III度', '牙周牙髓联合病变'],
        suggestedTreatment: ['根管治疗', '评估预后', '拔除', '种植修复'],
      },
    },
  },
  {
    id: 'impacted-1',
    levelId: 'impacted',
    title: '病例1：下颌水平阻生智齿',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dental%20panoramic%20x-ray%20showing%20horizontally%20impacted%20mandibular%20wisdom%20tooth%20pushing%20against%20second%20molar%20clinical%20dental%20imaging%20black%20background&image_size=landscape_4_3',
    chiefComplaint: '右下后牙区反复肿痛，张口受限一周',
    patientInfo: '男，22岁，大学生',
    standardAnswer: {
      toothPosition: '48水平阻生',
      imagingFindings: '48水平阻生，牙冠朝向47远中面，与47远中根面紧密接触，牙根为双根，根尖距下牙槽神经管较近，周围可见部分骨覆盖',
      preliminaryJudgment: '48水平阻生齿，伴冠周炎',
      suggestedTreatment: '48消炎后择期拔除，术前CBCT评估与下牙槽神经管关系，注意术中避免神经损伤',
      keywords: {
        toothPosition: ['48', '水平阻生'],
        imagingFindings: ['水平阻生', '47远中', '紧密接触', '双根', '下牙槽神经管较近', '骨覆盖'],
        preliminaryJudgment: ['48', '水平阻生齿', '冠周炎'],
        suggestedTreatment: ['消炎', '拔除', 'CBCT', '神经损伤'],
      },
    },
  },
  {
    id: 'impacted-2',
    levelId: 'impacted',
    title: '病例2：上颌垂直阻生智齿',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dental%20x-ray%20radiograph%20showing%20vertically%20impacted%20maxillary%20wisdom%20tooth%20close%20to%20maxillary%20sinus%20floor%20clinical%20dental%20imaging%20black%20background&image_size=landscape_4_3',
    chiefComplaint: '右上后牙区胀痛不适两周',
    patientInfo: '女，35岁，妊娠计划中',
    standardAnswer: {
      toothPosition: '18垂直阻生',
      imagingFindings: '18垂直阻生，牙冠部分萌出，根尖接近上颌窦底，牙根为三根，融合根趋势，根分叉可见，周围骨质未见明显异常',
      preliminaryJudgment: '18垂直阻生齿，根尖近上颌窦',
      suggestedTreatment: '18择期拔除，术前CBCT评估与上颌窦关系，备上颌窦穿孔修补方案，妊娠前完成处理',
      keywords: {
        toothPosition: ['18', '垂直阻生'],
        imagingFindings: ['垂直阻生', '部分萌出', '上颌窦底', '三根', '融合根', '骨质无异常'],
        preliminaryJudgment: ['18', '垂直阻生齿', '根尖近上颌窦'],
        suggestedTreatment: ['拔除', 'CBCT', '上颌窦穿孔修补', '妊娠前完成'],
      },
    },
  },
  {
    id: 'periodontal-1',
    levelId: 'periodontal',
    title: '病例1：水平型牙槽骨吸收',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dental%20x-ray%20radiograph%20showing%20horizontal%20alveolar%20bone%20loss%20on%20mandibular%20anterior%20teeth%20reduced%20bone%20height%20clinical%20dental%20imaging%20black%20background&image_size=landscape_4_3',
    chiefComplaint: '下前牙松动、牙龈出血半年',
    patientInfo: '男，50岁，吸烟20年',
    standardAnswer: {
      toothPosition: '31、32、33、41、42、43',
      imagingFindings: '下颌前牙区牙槽骨普遍水平吸收至根中1/3，骨硬板消失，牙周膜间隙增宽，31、41牙槽骨吸收约50%，余牙吸收约30%',
      preliminaryJudgment: '下颌前牙区中度至重度牙周炎，31、41松动II度',
      suggestedTreatment: '全口牙周基础治疗（洁治+刮治+根面平整），31、41可考虑牙周夹板固定，3个月后复查评估',
      keywords: {
        toothPosition: ['31', '32', '33', '41', '42', '43', '下前牙区'],
        imagingFindings: ['水平吸收', '根中1/3', '骨硬板消失', '牙周膜间隙增宽', '吸收50%', '吸收30%'],
        preliminaryJudgment: ['牙周炎', '中度', '重度', '松动II度'],
        suggestedTreatment: ['牙周基础治疗', '洁治', '刮治', '根面平整', '牙周夹板', '复查评估'],
      },
    },
  },
  {
    id: 'periodontal-2',
    levelId: 'periodontal',
    title: '病例2：垂直型骨吸收伴根分叉病变',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dental%20x-ray%20radiograph%20showing%20vertical%20angular%20bone%20loss%20and%20furcation%20involvement%20on%20mandibular%20molar%20clinical%20dental%20imaging%20black%20background&image_size=landscape_4_3',
    chiefComplaint: '左下后牙咀嚼无力、牙龈反复溢脓三月',
    patientInfo: '女，48岁，糖尿病史5年',
    standardAnswer: {
      toothPosition: '36近中、根分叉区',
      imagingFindings: '36近中可见垂直型骨吸收，近中牙槽骨呈角形缺损达根尖1/3，根分叉区透射影明显，远中根牙槽骨吸收至根中1/2',
      preliminaryJudgment: '36近中垂直型骨吸收伴根分叉病变（II度），牙周-牙髓联合病变可能',
      suggestedTreatment: '36先行根管治疗，并行牙周翻瓣术+骨移植术，近中行引导组织再生术，术后3个月复查',
      keywords: {
        toothPosition: ['36', '近中', '根分叉区'],
        imagingFindings: ['垂直型骨吸收', '角形缺损', '根尖1/3', '根分叉透射影', '根中1/2'],
        preliminaryJudgment: ['36', '垂直型骨吸收', '根分叉病变', 'II度', '牙周牙髓联合病变'],
        suggestedTreatment: ['根管治疗', '牙周翻瓣术', '骨移植术', '引导组织再生术', '复查'],
      },
    },
  },
]

export function getCasesByLevel(levelId: string): CaseData[] {
  return cases.filter((c) => c.levelId === levelId)
}

export function getCaseById(caseId: string): CaseData | undefined {
  return cases.find((c) => c.id === caseId)
}

export function getLevelById(levelId: string): Level | undefined {
  return levels.find((l) => l.id === levelId)
}
