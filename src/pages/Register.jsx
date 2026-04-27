import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParticles } from '../hooks/useParticles.js';
import { useMagnet } from '../hooks/useMagnet.js';
import { api, setAuthSession, userFacingError } from '../lib/api.js';

const TERMS_CONTENT = `BoHack 2026 用户服务协议

1. 导言

1.1 《BoHack 2026 用户服务协议》（以下简称"本协议"）是您（以下简称"参与者"或"您"）与 BoHack 2026 活动组织方（以下简称"组织方"或"我们"）之间，就您注册、登录、参与及使用 BoHack 2026 黑客松活动（以下简称"本活动"）相关服务所订立的具有法律约束力的协议。本活动包括但不限于线上报名、现场参与、项目开发、作品提交、评审颁奖等全部环节。

1.2 请您在参与本活动前，仔细阅读、充分理解本协议的全部内容，特别是涉及活动规则、知识产权归属与许可、免责声明、责任限制、争议解决等以加粗或下划线等形式提示您注意的条款。如您不同意本协议的任何内容，请立即停止注册或参与本活动。

1.3 您通过本活动官方指定平台完成注册、报名、或于活动现场完成签到并参与活动，即表示您已阅读、理解并同意完全接受本协议的全部约定，并承诺遵守活动期间组织方发布或修改的各项规则、公告及指引。

1.4 组织方有权根据活动筹备与运行的实际情况，在必要时单方面修改本协议及活动相关规则。修改后的内容将于活动官方平台（如活动官网、官方社群等）公布，并自公布之日起生效。若您在本协议内容变更后继续参与本活动，即视为您接受修订后的协议。

2. 参与资格与账号/报名信息

2.1 您确认，您符合本活动对参与者（如学生、开发者、设计师等）身份的基本要求，并保证为参与活动所提交的所有信息（包括但不限于姓名、身份证件信息、联系方式、所属院校或单位、团队信息等）真实、准确、完整、有效。

2.2 您理解并同意，组织方有权对您提交的信息进行审核。如发现信息不实、重复报名、恶意注册、违反年龄规定或不符合活动参与资格等情形，组织方有权在活动任何阶段取消您的参与资格，并不承担任何责任。

2.3 您有义务妥善保管参与活动所需的各类凭证，包括但不限于电子门票、签到二维码、号码贴纸、参赛证件等。该等凭证仅限您本人使用，不得转让、出借、出售或用于任何非本活动之目的。

3. 活动行为准则与团队协作

3.1 您承诺在活动全过程（包括线上及线下）中遵守中华人民共和国法律法规，尊重社会公德和民族习俗，维护活动秩序，不得从事任何违法违规、破坏公共安全、侵犯他人权益或违背公序良俗的行为。

3.2 您应尊重他人的知识产权、名誉权、隐私权等合法权益。您在本活动中所创作并提交的项目成果（定义见第6条）必须是您及您所在团队在活动规定时间内（2026年5月22日至24日）的原创作品，或确保已获得所有必要的第三方授权或许可。严禁抄袭、盗用他人作品或受版权保护的内容。

3.3 您不得以任何方式干扰、破坏本活动的正常进行，包括但不限于：
- 对活动网络系统进行攻击、扫描、入侵或散布恶意代码、病毒；
- 进行任何形式的作弊，如购买代码、场外代做、虚构演示效果等；
- 恶意刷票、诋毁其他参与者、发布不当言论或垃圾信息；
- 其他被组织方认定为妨碍活动公平性、完整性的行为。

3.4 您同意在活动期间，严格遵守活动现场（天津市）的各项管理规定，服从组织方工作人员、志愿者及场地管理方的管理和指引，主动配合进行安全检查，并妥善使用场地内设施设备。

3.5 关于团队组建与变更：
- 团队协作是本活动的核心形式之一；
- 团队组建应在组织方规定的时间内完成，并按要求提交团队成员名单；
- 团队内部应自行协商确定成员分工、贡献度及内部沟通机制，组织方不介入团队内部事务或纠纷；
- 团队负责人或成员变更需遵循组织方公布的流程，并在截止时间前完成，逾期或不符规则的变更可能导致团队丧失参赛资格。

4. 网络安全保护

4.1 共同维护安全环境：您理解并同意，一个安全、稳定的网络环境是本次活动顺利开展的基础。您承诺不会从事任何可能干扰、破坏或未经授权访问活动官方平台、网络系统及相关设施的行为。

4.2 禁止的网络安全行为（包括但不限于）：
- 网络入侵与干扰：尝试或实际侵入活动网络，干扰其正常功能，或非法获取、篡改、窃取任何网络数据；
- 提供破坏性工具：制作、传播或提供专门用于网络攻击、数据窃取等危害网络安全活动的工具或程序；
- 协助非法活动：在明知他人从事危害网络安全活动的情况下，仍为其提供技术、宣传或资金等方面的支持；
- 越权访问：未经授权访问不属于您使用的数据、服务器或用户账号；
- 安全漏洞探测：在未获明确许可的情况下，对活动网络或系统进行安全扫描、漏洞探测或压力测试；
- 技术规避与反编译：试图对活动平台进行反向工程、反汇编、解密，或以其他任何方式获取其源代码；
- 滥用注册功能：使用自动化脚本或其他非正当手段恶意注册大量活动账号。

4.3 安全漏洞的报告义务：如果您发现活动网络系统存在任何安全漏洞或隐患，有义务立即通过官方指定渠道向组织方报告，并应避免进行任何可能扩大安全风险的操作。

4.4 违约处理权限：若组织方根据合理判断，认为您的行为已违反本协议或对活动网络及数据安全构成威胁，组织方有权立即采取必要措施，包括但不限于中断您的网络连接、取消您的参与资格、封禁相关账号，并保留证据以便依法追究相应责任。

5. 违约处理

5.1 如果您违反本协议的任何约定，组织方有权根据违约行为的严重程度，独立判断并采取以下一项或多项处理措施：
- 警告纠正：要求您立即停止违约行为并消除影响；
- 限制权限：限制您账号的部分或全部功能，或限制您参与活动的部分或全部环节；
- 取消资格：取消您个人或所在团队的参与及获奖资格；
- 公示通报：在适度范围内公示违约行为及处理结果，以维护活动公正性；
- 追究责任：依法追究您的法律责任，包括要求赔偿因此给组织方、其他参与者或第三方造成的损失。

5.2 如果您或您的团队采取不正当手段获取活动奖金、奖品或荣誉，组织方有权取消或撤回相关奖励。如奖励已发放，组织方有权要求您或您的团队退回奖品或等值现金。

5.3 因您的违约行为导致组织方承担赔偿责任或遭受行政处罚的，您应赔偿组织方因此遭受的全部损失。

5.4 对于涉嫌违法犯罪的行为，组织方将保存有关记录，并有权依法向有关主管部门报告、配合调查。

6. 知识产权

6.1 所有权：您及您所在团队在本活动中独立创作完成的项目成果，包括但不限于源代码、可执行程序、硬件设计、文档、演示文稿、设计图稿、数据模型等（统称为"项目成果"），其知识产权归该团队所有。

6.2 对组织方的许可：为便于活动的宣传、展示、评审及存档，您及您的团队在此授予组织方一项全球范围内、免费的、非独家的、不可撤销的许可，允许组织方在与本活动相关的合理范围内使用、复制、演示、展示项目成果的名称、描述、截图、演示视频等材料。此许可超出活动必要范围时，组织方将另行征求您的同意。

6.3 第三方内容：如果您的项目成果中包含了第三方的开源代码、库、API、数据集或其他受知识产权保护的材料（"第三方内容"），您必须确保对该等第三方内容的使用符合其相应的许可协议的所有条款，并在项目成果中清晰标注所有第三方内容的来源及适用的许可协议。组织方对您因使用第三方内容而产生的任何纠纷或责任不承担任何责任。

6.4 展示与宣传：您同意组织方可能对活动过程进行录音、录像及摄影，并有权在各类媒体上使用这些资料用于活动回顾和公益宣传。您参与活动即视为同意您的肖像在上述用途中被使用。

7. 奖项、奖励与税务

7.1 组织方将依据事先公布的评审标准，组织评审团对有效提交的项目成果进行公正、公开的评审。评审结果以评审团的最终决定为准。

7.2 获奖团队有义务配合组织方完成身份核实、银行账户信息收集等奖金发放所必需的程序。如因获奖团队未能及时提供准确信息或配合相关工作而导致奖金无法发放，责任由获奖团队自行承担。

7.3 组织方严禁任何形式的作弊行为。如在获奖名单公布前后，发现任何参与者存在抄袭、舞弊、提供虚假信息、违反活动规则等行为，组织方有权单方面取消其获奖资格，并有权追回已发放的奖金、奖品及证书。

7.4 根据中华人民共和国相关法律法规，您通过参与本活动获得的奖金、奖品等可能产生的个人所得税，由获奖者自行承担。组织方将根据税务机关的要求，依法履行代扣代缴义务。

8. 免责与责任限制

8.1 不可抗力：您理解并同意，组织方不对因超出其合理控制范围的任何原因（即"不可抗力"）直接或间接导致的活动中断、延期、取消、场地变更或数据丢失承担责任。不可抗力事件包括但不限于地震、洪水、火灾、瘟疫、战争、恐怖袭击、政府行为、电力中断、通讯网络故障等。

8.2 个人财物与安全：您应自行妥善保管在活动期间携带的个人财物。组织方对您个人财物的丢失、被盗或损坏不承担责任。同时，您有责任确保自身身体状况适合参与高强度、长时间的编程活动，并根据需要自行购买相关保险。活动现场将提供基本的医疗支持，但组织方不承担因您个人健康原因引发的任何后果。

8.3 项目风险：您理解并承认，黑客松活动具有挑战性和不确定性。您自愿承担因参与活动、开发项目所可能带来的一切风险，包括但不限于项目未能完成、未能获奖、创意被他人借鉴等。

8.4 服务"按现状"提供：组织方尽最大努力确保活动平台及现场服务的稳定与安全，但无法保证其完全无中断、无错误或绝对安全。您使用活动服务及由此产生的任何风险均由您自行承担。

9. 个人信息保护

9.1 组织方将严格遵守《中华人民共和国个人信息保护法》等相关法律法规，收集、使用、存储和保护您的个人信息仅用于本活动的报名、组织、评审、颁奖、通知及法律合规之目的。

9.2 未经您事先明确同意，组织方不会向任何无关第三方提供、出售、出租您的个人信息，但以下情况除外：为遵守法律法规或响应司法机关、行政机关的合法要求；为保护组织方、其他参与者或社会公众的合法权益、财产安全或安全所需。

10. 协议的变更、中止与终止

10.1 组织方有权根据法律法规政策变化、活动需要或运营实际情况，修改本协议条款。修改后的协议将公布于活动官方平台。

10.2 若您严重违反本协议或活动规则，对活动、其他参与者、组织方或任何第三方造成损害，组织方有权立即中止或终止您继续参与活动的资格，并保留追究相应法律责任的权利。

11. 法律适用与争议解决

11.1 本协议的订立、效力、解释、履行、修改及终止均适用中华人民共和国法律（不包括其冲突法规则）。

11.2 因本协议引起或与本协议有关的任何争议，双方应首先通过友好协商解决。若协商不成，任何一方均有权将争议提交至本活动举办地（即天津市）有管辖权的人民法院通过诉讼解决。

12. 其他规定

12.1 本协议自您完成报名或现场签到参与活动之日起生效，至本次活动全部环节（包括颁奖及后续事宜处理完毕）结束后终止。其中，关于知识产权、保密、免责、法律适用与争议解决的条款在本协议终止后仍然有效。

12.2 如本协议的任何条款被认定为无效或不可执行，该条款应在不影响其他条款效力的前提下，在尽可能符合原条款目的范围内进行解释或修正，其余条款仍保持完全有效。

12.3 本协议（包括活动官方平台公布的所有规则、指南及公告）构成您与组织方就本活动达成的完整协议，并取代您与组织方先前就本活动所达成的任何口头或书面约定。

如有疑问，请联系：contact@bohack.top`;

const PRIVACY_CONTENT = `BoHack 平台隐私政策

BoHack 平台及配套线上服务（以下简称"本平台"）由 BoHack 活动组委会（以下简称"我们"）负责搭建与运营。我们是由天津创业青年组成的公益团体，不以盈利为目的，核心目标是为天津打造平等、开放、纯粹的创新实践空间。除非另有特别说明，本隐私政策中提及的"我们"或"BoHack 平台运营方"，均指代上述主体。

我们深刻认识到个人信息对您的重要性，将严格依据《中华人民共和国个人信息保护法》《信息安全技术 个人信息安全规范》等法律法规，全力保障您的个人信息与隐私安全。本隐私政策旨在向您清晰阐述我们收集、使用、存储、传输、公开个人信息的具体方式，以及您依法享有的相关权利。请您在使用本平台、参与 BoHack 相关活动前，仔细阅读并充分理解本政策内容——您完成注册、登录或使用本平台服务的行为，将视为您已接受并认可本政策的全部条款。

对于与您个人信息权益密切相关的关键条款，我们已用加粗形式特别标注，请您重点关注。除实现本平台基础功能、提供 BoHack 活动配套服务所必需的信息，以及法律法规强制要求收集的信息外，您有权拒绝我们收集其他信息，但这可能导致您无法正常使用对应功能或参与相关活动。

除本隐私政策外，在特定场景（如活动报名、Workshop 预约、项目提交等）下，我们还会通过弹窗提示、页面说明等即时告知方式，向您明确该场景下信息收集的目的、范围及使用规则。这些即时告知内容与本隐私政策具有同等效力，共同构成您与我们之间关于个人信息保护的完整约定。

一、个人信息的收集与使用场景

1.1 账号创建与登录验证

当您注册并登录本平台时，可通过邮箱创建专属账号，并可自主完善网络身份信息（包括 BoHack 平台账号、头像、昵称、密码）。我们收集此类信息，仅为帮助您完成账号注册流程，确保您能正常使用平台功能、参与活动相关操作。

若您遗忘登录密码，可通过"密码找回"功能重置。为保障您的账号安全，我们可能要求您填写注册时预留的信息进行身份验证，必要时还会通过额外身份核验方式确认账号归属，防止账号被非法盗用。

1.2 活动报名与参与配套

为顺利推进 BoHack 黑客松及相关配套活动（如企业展会、Workshop 培训、项目答辩等），您在提交报名表单时，需提供部分必要信息（未标注"*"的为自愿填写项），具体包括：昵称、年龄*、手机号*、邮箱*、学校/单位*、MBTI 性格类型、自我介绍*、技能描述*、国家与地区*、掌握语言*、出生日期*、参赛创意构想*、过往经历/项目/实习/奖项*、个人简历、作品集、社交媒体链接、团队合作能力说明*、思考能力阐述*、个人适配度说明*。

我们收集这些信息，仅用于完成参赛资格审核、协助团队组建匹配、安排活动行程、开展奖项评选及后续成果对接，所有信息均仅限 BoHack 活动相关场景使用。

1.3 通知消息的推送与管理

您同意我们通过您注册时提供的联系方式（如邮箱、手机号），向您发送与 BoHack 活动直接相关的必要通知，包括但不限于报名审核结果、活动日程提醒、Workshop 预约确认、项目提交通道开放通知、奖项公示信息等。

此外，我们可能会向您推送与活动相关的商业性信息（如合作企业的招聘需求、后续同类创新活动邀请等）。若您不愿接收此类信息，可通过通知中的退订链接，或直接联系我们关闭推送，我们将在收到您的需求后及时处理。

1.4 分享互动功能的信息调用

当您使用本平台的分享功能（如分享活动信息、团队项目链接）、接收他人分享的内容，或参与平台互动（如项目点赞、人气投票）时，本平台可能需要在本地访问您的剪切板，读取其中包含的口令、分享码或链接，以实现页面跳转、分享联动等功能。

需特别说明的是，仅当剪切板内容或图片中的口令被本地识别为 BoHack 平台相关的跳转、分享指令时，我们才会将其上传至服务器；除此之外，本平台不会上传您剪切板或相册中的任何其他信息。

1.5 平台运营与安全保障需求

为向您提供安全、稳定的平台服务，维护活动的公平公正，保护您及其他用户的合法权益，我们会收集以下必要信息，且仅用于本条款所述目的：

1. 设备与网络信息：包括您的硬件型号、操作系统版本号、设备标识符（Android 系统如 AndroidID、OAID、GAID，iOS 系统如 IDFV、IDFA）、网络设备硬件地址（MAC 地址）、IP 地址、WLAN 接入点信息（如 SSID、BSSID）、网络接入方式/类型/状态、网络质量数据等，用于保障平台稳定运行、排查技术故障；
2. 服务日志信息：包括您使用本平台的操作记录、登录日志、项目提交记录、Workshop 参与记录等，用于分析平台使用情况、优化服务体验；
3. 安全验证信息：结合上述信息及您的账号信息，用于识别账号异常登录、防范作弊行为、检测及处理安全事件，保障活动公平性与账号安全。

我们可能将上述信息与合作方提供的、经您授权或依法可共享的信息结合使用，但仅为实现安全保障与运营优化目的，不会用于其他无关场景。

1.6 服务调整后的信息处理规则

随着 BoHack 活动筹备的推进，本平台提供的产品或服务可能会进行合理调整。若调整后的数据处理目的、方式或范围发生变化，我们将通过平台公告、站内信等方式另行告知您，并在获得您的同意后（法律法规另有规定的除外），再进行相关信息处理。

1.7 无需授权即可处理信息的法定情形

根据法律法规规定，在下列情形中，我们处理您的个人信息无需征得您的授权同意：

1. 为订立或履行您与我们之间的活动参与协议所必需；
2. 为履行法定职责或法定义务所必需（如与国家安全、国防安全、刑事侦查、起诉、审判和判决执行等直接相关）；
3. 为应对突发公共卫生事件，或在紧急情况下为保护自然人的生命健康和财产安全所必需；
4. 为公共利益实施新闻报道、舆论监督等行为，在合理范围内处理个人信息；
5. 在合理范围内处理您自行公开的个人信息，或其他已合法公开的个人信息；
6. 法律法规规定的其他情形。

特别说明：根据法律规定，无法单独或结合其他信息识别到特定个人的信息，不属于个人信息。当您的信息可单独或结合其他信息识别到您，或我们将无关联数据与您的个人信息结合使用时，该信息将被视为个人信息，严格按照本隐私政策进行保护。

二、合作方参与的数据处理与信息流转

2.1 合作方协作的基本原则与范围

2.1.1 核心协作原则

我们与所有合作方的协作均遵循以下原则：

1. 合法性原则：所有涉及个人信息的处理活动，均严格符合法律法规要求；
2. 正当与最小必要原则：数据使用具有明确的正当目的，且仅收集实现该目的所必需的最少信息；
3. 安全审慎原则：我们会对合作方的信息处理目的、安全保障能力进行严格评估，与其签订正式合作协议明确数据安全责任，并对合作方的信息使用行为进行持续监督。

2.1.2 合作方具体范围

本平台的合作方包括但不限于：活动指导单位、场地提供方、金融服务支持方、企业合作方、参与院校及相关技术服务提供商。

2.1.3 信息共享的具体边界

1. 普通注册用户：我们仅会将您的邮箱地址共享给受信任的合作方，用于活动相关的必要沟通；
2. 参赛选手（已提交报名表单者）：我们会将您在报名表单中填写的信息（含必填项与自愿填写项）共享给合作方，用于提供活动支持、资源对接、奖项兑现等服务；
3. 敏感信息保护：法定姓名、身份证明文件等个人敏感信息，绝不会与任何第三方共享。若因业务必需确需共享，需在获得您的二次明确同意，并充分说明信息用途后，才会进行共享。

2.2 运营主体变更时的信息处理

若因活动发展需要，我们发生合并、收购、资产转让等运营主体变更，您的个人信息可能会随之转移。在此情况下，我们将要求继受方严格按照本隐私政策保护您的个人信息；若继受方变更原有的信息处理目的或方式，我们将要求其重新征得您的明确同意。

2.3 个人信息的公开规则

我们不会主动公开您未自行公开的个人信息，除非：已获得您的明确同意；遵循国家法律法规规定；或为保护您或其他用户、公众的合法权益在合理范围内公开。

三、您享有的个人信息相关权利

我们高度重视您对个人信息的自主管理权，全力保障您依法享有的以下权利：

1. 查阅权：您有权登录本平台账号，查看您已提交的个人信息、报名记录、参与记录等；
2. 复制权：您有权要求我们向您提供您的个人信息副本；
3. 更正权：若您发现个人信息存在错误，有权登录平台自行修改，或联系我们协助更正；
4. 补充权：若您的个人信息不完整，有权补充完善相关信息；
5. 删除权：在符合法律法规规定的情形下，您有权要求我们删除您的个人信息；
6. 撤回同意权：您有权撤回对信息收集、使用、共享的同意，但撤回后我们将无法继续为您提供相应的功能或服务；
7. 账号注销权：您有权申请注销平台账号，账号注销后，我们将对您的个人信息进行删除或匿名化处理（法律法规要求保留的除外）；
8. 投诉举报权：若您认为您的个人信息权利受到侵害，有权向我们投诉举报。

四、个人信息的安全保障措施

我们采取技术与管理相结合的多重措施，全力保障您的个人信息安全，防止信息遭受未授权访问、泄露、篡改、丢失。我们使用不低于行业标准的加密技术、去标识化、匿名化处理等手段保护您的个人信息，并建立安全防护机制防范恶意攻击和网络入侵。

我们设立专门的信息安全管理团队，制定完善的安全管理制度和数据安全处理流程，采取严格的信息访问权限控制，定期对工作人员进行信息安全培训，并对数据处理流程进行定期安全审计。

若发生个人信息安全事件，我们将立即启动应急预案，采取补救措施，并按法律法规要求及时通知您，内容包括：泄露信息的种类、原因及可能危害；已采取的补救措施；您可采取的减轻危害的措施；以及我们的联系方式。

五、个人信息的存储管理规则

所有用户的个人信息均安全存储于中国境内。我们将按照"最小必要、最短期限"的原则存储您的个人信息：

1. 未成功提交报名申请的用户或游客，其填写的信息将在活动结束后自动清除；
2. 已成功提交报名申请的用户，其个人信息将在活动结束后保留不超过 6 个月，期间仅用于活动成果对接、奖项兑现等必要事宜，逾期将自动删除或匿名化处理；
3. 法律法规另有规定的，从其规定。

六、隐私政策的查阅与修订方式

您可在本平台的注册登录页面随时查阅本隐私政策的完整内容。本政策修订后，我们将在平台显著位置发布更新版本，并通过站内信、邮件等方式提醒您查看，请您留意。

七、与我们联系的方式

若您对本隐私政策有任何疑问、建议，或认为您的个人信息权利受到侵害，可通过以下方式与我们联系：

官方邮箱：contact@bohack.top`;

function PolicyModal({ title, content, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="policy-overlay" onClick={onClose}>
      <div className="policy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="policy-modal-header">
          <span className="policy-modal-title">{title}</span>
          <button type="button" className="policy-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="policy-modal-body">
          {content.split('\n').map((line, i) => (
            line.trim() === '' ? <br key={i} /> : <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

const RESEND_CODE_SECONDS = 60;

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function usernameFromEmail(email) {
  return normalizeEmail(email)
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
}

function Poster() {
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  const stats = [
    { n: '1', t: '先创建账号' },
    { n: '2', t: '再填写问卷' },
    { n: '3', t: '审核通过后成为选手' },
  ];

  return (
    <aside className="auth-poster">
      <canvas ref={canvasRef} className="auth-poster-canvas" />
      <div className="auth-poster-grid" />

      <div className="auth-brand">
        <img
          src="/BoHack-LOGO-%E5%8F%8D%E7%99%BD.svg"
          alt="BoHack"
          className="auth-brand-logo"
        />
        <span>Bohack / 2026</span>
      </div>

      <div className="auth-poster-body">
        <div className="auth-poster-eyebrow">◉ 邮箱验证 · 账号注册</div>
        <h1 className="auth-poster-title">
          创建<span className="accent"> 账号。</span>
        </h1>
        <p className="auth-poster-lede">
          账号用于保存报名问卷和查看审核状态。只有问卷审核通过后，账号才会成为正式选手身份。
        </p>
        <div className="auth-poster-stats">
          {stats.map((s) => (
            <div className="s" key={s.t}>
              <div className="n">{s.n}</div>
              <div className="t">{s.t}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-poster-footer">
        <span>天津 / 2026.05.22-31</span>
        <span>WIE 2026</span>
      </div>
    </aside>
  );
}

export default function Register() {
  useMagnet();

  const [data, setData] = useState({
    username: '',
    email: '',
    verificationCode: '',
    password: '',
    confirm: '',
    agree: false,
  });
  const [errs, setErrs] = useState({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeMessage, setCodeMessage] = useState('');
  const [modal, setModal] = useState(null);
  const [codeCooldown, setCodeCooldown] = useState(0);

  useEffect(() => {
    document.body.classList.add('auth-body');
    return () => document.body.classList.remove('auth-body');
  }, []);

  useEffect(() => {
    if (codeCooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setCodeCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [codeCooldown]);

  const up = (key, value) => setData((current) => ({ ...current, [key]: value }));

  const validateAccount = ({ requireCode = true } = {}) => {
    const nextErrs = {};
    const email = normalizeEmail(data.email);
    const username = data.username.trim();

    if (!username || username.length > 50) nextErrs.username = '请填写 1-50 个字符的用户名';
    if (!email || !/.+@.+\..+/.test(email)) nextErrs.email = '请输入有效邮箱';
    if (requireCode && !/^\d{6}$/.test(data.verificationCode.trim())) {
      nextErrs.verificationCode = '请输入 6 位邮箱验证码';
    }
    if (data.password.length < 8) nextErrs.password = '密码至少 8 位';
    if (data.password !== data.confirm) nextErrs.confirm = '两次密码不一致';
    if (requireCode && !data.agree) nextErrs.agree = '请先同意用户协议和隐私说明';

    setErrs(nextErrs);
    return Object.keys(nextErrs).length === 0;
  };

  const sendCode = async () => {
    if (sendingCode || codeCooldown > 0) return;

    const email = normalizeEmail(data.email);
    if (!email || !/.+@.+\..+/.test(email)) {
      setErrs({ email: '请输入有效邮箱后再发送验证码' });
      return;
    }

    setSendingCode(true);
    setCodeMessage('');
    setErrs({});
    try {
      await api.sendVerificationCode({
        email,
        codeType: 'register',
      });
      setCodeMessage('验证码已发送，请检查邮箱。');
      setCodeCooldown(RESEND_CODE_SECONDS);
    } catch (error) {
      setErrs({ form: userFacingError(error) });
    } finally {
      setSendingCode(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validateAccount()) return;

    setSubmitting(true);
    setErrs({});
    try {
      const auth = await api.register({
        username: data.username.trim(),
        email: normalizeEmail(data.email),
        password: data.password,
        verificationCode: data.verificationCode.trim(),
      });
      setAuthSession(auth);
      setDone(true);
    } catch (error) {
      setErrs({ form: userFacingError(error) });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="auth-shell">
        <Poster />
        <main className="auth-panel">
          <div className="auth-topbar">
            <Link to="/" className="auth-back">← 返回主页</Link>
            <span className="auth-topbar-meta">/ 账号已创建</span>
          </div>

          <div className="auth-form">
            <div className="auth-eyebrow">Account Created</div>
            <h1 className="auth-h1">账号已创建。</h1>
            <p className="auth-sub">
              你现在可以填写 BOHACK 2026 报名问卷。问卷审核通过后，你的账号才会升级为选手身份。
            </p>

            <div className="auth-btn-row">
              <Link to="/questionnaire" className="auth-submit magnet">
                <span>填写报名问卷</span>
                <span className="arrow">↗</span>
              </Link>
              <Link to="/user" className="auth-ghost magnet">进入控制台</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <Poster />

      <main className="auth-panel">
        <div className="auth-topbar">
          <Link to="/" className="auth-back">← 返回主页</Link>
          <span className="auth-topbar-meta">/ 创建账号</span>
        </div>

        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-eyebrow">邮箱验证码注册</div>
          <h1 className="auth-h1">创建账号。</h1>
          <p className="auth-sub">
            已有账号? <Link to="/login" className="auth-link">直接登录 →</Link>
          </p>

          <div className={'auth-field' + (errs.email ? ' is-error' : '')}>
            <label>
              邮箱 <span className="hint">用于登录和接收通知</span>
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => {
                const email = e.target.value;
                up('email', email);
                if (!data.username) up('username', usernameFromEmail(email));
              }}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
            {errs.email && <div className="auth-err">{errs.email}</div>}
          </div>

          <div className={'auth-field' + (errs.verificationCode ? ' is-error' : '')}>
            <label>
              邮箱验证码 <span className="hint">6 位数字</span>
            </label>
            <div className="auth-pw-wrap">
              <input
                value={data.verificationCode}
                onChange={(e) => up('verificationCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={sendCode}
                disabled={sendingCode || codeCooldown > 0}
              >
                {sendingCode
                  ? '发送中'
                  : codeCooldown > 0
                  ? `${codeCooldown}s 后重发`
                  : '发送验证码'}
              </button>
            </div>
            {codeMessage && <div className="auth-field-meta"><span className="hint">{codeMessage}</span></div>}
            {errs.verificationCode && <div className="auth-err">{errs.verificationCode}</div>}
          </div>

          <div className={'auth-field' + (errs.username ? ' is-error' : '')}>
            <label>
              用户名 <span className="hint">可之后在后台识别你</span>
            </label>
            <input
              value={data.username}
              onChange={(e) => up('username', e.target.value)}
              placeholder="bohack_user"
              autoComplete="username"
              maxLength={50}
            />
            {errs.username && <div className="auth-err">{errs.username}</div>}
          </div>

          <div className="auth-field-row">
            <div className={'auth-field' + (errs.password ? ' is-error' : '')}>
              <label>
                登录密码 <span className="hint">至少 8 位</span>
              </label>
              <input
                type="password"
                value={data.password}
                onChange={(e) => up('password', e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errs.password && <div className="auth-err">{errs.password}</div>}
            </div>
            <div className={'auth-field' + (errs.confirm ? ' is-error' : '')}>
              <label>
                确认密码 <span className="hint">再输入一次</span>
              </label>
              <input
                type="password"
                value={data.confirm}
                onChange={(e) => up('confirm', e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errs.confirm && <div className="auth-err">{errs.confirm}</div>}
            </div>
          </div>

          <div
            className={
              'auth-field auth-field-agree' +
              (errs.agree ? ' is-error' : '')
            }
          >
            <label className="auth-agree-label">
              <input
                type="checkbox"
                checked={data.agree}
                onChange={(e) => up('agree', e.target.checked)}
              />
              <span>
                我已阅读并同意 BOHACK{' '}
                <button
                  type="button"
                  className="auth-policy-link"
                  onClick={(e) => { e.preventDefault(); setModal('terms'); }}
                >用户协议</button>
                {' '}与{' '}
                <button
                  type="button"
                  className="auth-policy-link"
                  onClick={(e) => { e.preventDefault(); setModal('privacy'); }}
                >隐私说明</button>
                。
              </span>
            </label>
            {errs.agree && <div className="auth-err">{errs.agree}</div>}
          </div>

          {errs.form && <div className="auth-err auth-form-err">{errs.form}</div>}

          <div className="auth-btn-row">
            <button
              type="submit"
              className="auth-submit magnet"
              disabled={submitting}
            >
              <span>{submitting ? '创建中…' : '创建账号'}</span>
              <span className="arrow">↗</span>
            </button>
            <Link to="/login" className="auth-ghost magnet">登录</Link>
          </div>
        </form>
      </main>
      {modal && (
        <PolicyModal
          title={modal === 'terms' ? 'BOHACK 用户协议' : 'BOHACK 隐私说明'}
          content={modal === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
