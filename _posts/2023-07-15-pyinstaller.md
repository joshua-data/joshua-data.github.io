---
layout: post
title: "데이터 분석가의 파이썬 클라이언트 개발기 feat. pyinstaller"
tags:
  - Language (Korean)
  - Article (Project)
  - Level (Intermediate)
  - Field (RPA)
  - Skills (Python)
---

> 파이썬 파일을 실행하기 위해서는 파이썬의 High-level 언어를 Low-level로 변환해주는 **Interpreter**가 필요하고, 또 파이썬 파일 내에서 Load해야 하는 **모듈** 역시 함께 사전에 설치되어야 하는데요.  `pyinstaller`는 이러한 Interpreter와 모듈을 함께 동봉한 채로 파이썬 파일을 패키징하여 하나의 실행 파일로 만들어주는 역할을 하는 것이죠.

### CONTENTS
1.  데이터 분석가로 살아가며
2.  누워서 떡 먹듯 업무 자동화를 경험하실 수 있도록 하려면 어떻게 해야 할까요?
3.  파이썬 설치와 실행 방법을 모르더라도 `pyinstaller` 하나면 모든 것이 가능해요!
4.  `.ipynb` 파일을 `.exe` 파일로 만드는 방법
5.  데이터 분석가가 갖추어야 하는 중요한 태도, “떠먹여 드리기”

---

# 1. 데이터 분석가로 살아가며

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/milk.png)

저는 블록체인 지갑 기업에서 데이터 분석가로 근무하고 있는 Joshua라고 합니다. 원래 이 업계에서 다른 포지션으로 근무하고 있었지만, 머신러닝과 빅데이터에 대한 천명(?)과 같은 깊은 흥미를 느끼게 되어 직장과 AI 대학원 생활을 2년 동안 병행해왔는데요. 정말 감사하게도 대학원을 잘 졸업하고, 지금 회사에서 데이터 분석가 포지션으로 근무하게 된지 1년이 넘어가고 있습니다.

훌륭하신, 그리고 인간적인 동료 분들과 함께 매일 치열하게 프로덕트에 대해 고민하고 있는데요. 특히, 한 분, 한 분과 이야기를 하거나 협업을 하다보면 제게 많은 자극을 알게 모르게 주시기도 하고, 스스로도 성장 욕구가 끊임 없이 일어나기도 한답니다. (입사 당시에도 그렇고, 1년이 지난 지금도 그 감정이 오롯이 유지되고 있어요.)

**머리로 기억하고 있는 선배 동료 분들의 어록 모음**
> "조급한 마음으로 업무를 하게 되면 나중에 어떤 모습으로든 사고가 날 수 있다. 항상 차근차근 기초에 충실하는 게 중요해요."
> "3년 후, 5년 후의 미래를 종종 그려보며 커리어 방향을 점검해보는 게 되게 중요해요."
> "저는 나이가 들수록 말을 하거나 글을 쓰는 등 표현하는 게 부담스러워져요. 내가 알고 느끼는 것이 틀릴 수도 있으니까요."

이런 동료 분들과 함께, 그리고 성장 가능성이 무궁무진한 블록체인 도메인 속에서 매일 밤 이불을 덮으며 “**나는 꼭 월드 클래스가 될 거야**”라는 생각을 하며 지내고 있어요.

데이터 분석가의 메인 업무에 대한 이야기는 다음 아티클에서 또 전달해드리도록 하고, 오늘은 조금 희귀한(?) 스토리를 전달해드리고자 합니다.

가끔 몇몇 동료 분들이 제게 이런 말씀을 하실 때가 많아요.
> “Joshua님은 데이터 분석가인데 왜 개발을 하고 계세요?”

그럴 때마다 저는 이렇게 답변 드리곤 합니다.
> “저.. 저는 단지 데이터 추출과 가공 때문에 코드를 짜고 있는 건데요? 개발 잘 몰라요^^;;;;;”

물론 시간이 흐르며, 프론트엔드와 백엔드 개발도 데이터 크롤링과 가공의 프로세스도 지니고 있어서 상당히 유사한 작업이 많다는 사실을 이해하게 되어 지금은 살짝 인정을 하고 있어요. (그럼에도 불구하고 데이터 분석은 결이 좀 다르다구요!😆)

아무튼, 이번 아티클에서 제가 전달해드리려는 내용은 “**데이터 분석가로서 반드시 알 필요는 없는, 그렇지만 알아두면 재미있고 쓸모 있는 클라이언트 개발 후기**”입니다!

곰곰이 생각해보면, 현 회사에서 데이터 분석가로서 Day-to-day Responsibilities가 크게  **메인 업무**와  **서브 업무**  두 가지로 카테고리화되는 것 같아요.

**| 메인 업무**
* 핵심 지표 모니터링을 위한 대시보드 생성 및 관리
* Ad-hoc 데이터 분석
* A/B 테스트 결과 데이터 분석
* 이벤트 로그 스키마 정의

**| 서브 업무**
* API 크롤링을 통한 시장 데이터 수집 후 분석
* 블록체인 온체인 데이터 수집 후 분석
* 블록체인 메인넷 리서치
* 기타 등등

특히  **서브 업무**는 데이터 분석가로서 Must-have 업무가 아닐 수 있지만, 저는 개인적으로 서브 업무를 함으로써 회사의 사업 전략과 프로덕트에 대한 Domain Knowledge를 키워갈 수 있는 매우 값진 경험이라고 생각하는데요.

최근에는 사내 재무팀 분들을 위해 내부용 파이썬 업무 자동화 클라이언트를 개발하여 배포하는 과정을 겪으며, 재무팀 동료 분들이 어떤 고민을 하시는지, 그리고 어떤 목표와 역할을 위해 최선을 다하고 계시는지 진득하게 이해할 수 있었어요.

# 2. 누워서 떡 먹듯 업무 자동화를 경험하실 수 있도록 하려면 어떻게 해야 할까요?

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/i-dont-know-why.png)

회사 내부용 목적에 대해 공개할 수는 없지만, 재무팀 업무시 매뉴얼하게 데이터를 확인하는 것이 거의 불가능한 업무 포인트가 있었는데요. 그 부분을 API를 통해 크롤링할 수 있도록 파이썬 모듈을 만들 수 있겠다는 생각이 들었어요.

파이썬 크롤러 자체를 만드는 것은 어려운 일이 아니었지만, 파이썬 실행 환경에 대해 생각해보니 고민이 생겼어요.
> “데이터 분석가와 백엔드 개발자에게는 파이썬 클라이언트를 설치하고, 노트북 상에서 코드를 실행하거나 명령 프롬프트 상에서 파이썬을 실행하는 게 너무나도 익숙한 일인데, 이게 과연 재무팀 분들께도 익숙한 일일까?”

물론, 업무 자동화로 인한 시간 절감 효과가 파이썬 실행 환경 적응 시간보다 훨씬 크다면 큰 문제가 되지는 않겠지만, 그럼에도 불구하고  `CX(Colleague Experience?)`를 고려한 업무 자동화 환경을 제공해드리고 싶었거든요.

# 3. 파이썬 설치와 실행 방법을 모르더라도 `pyinstaller` 하나면 모든 것이 가능해요!

개발자 친구에게 이 고민을 털어놓기도 하고, 개인적으로 구글링을 하면서 알게 된 것은 바로  **Python Executable File**이라는 개념이었어요. 즉, 파이썬 환경을 구축하지 않고, 혹은 명령 프롬프트 같은 화성 같은 환경을 경험하지 않고도, `.exe` 확장자의 파일 자체를 클릭하는 것만으로 업무 자동화가 진행되는 실행 파일을 만드는 방법인 것이죠.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/infinite-challenge.jpeg)

정말 감사하게도, 파이썬에는  `pyinstaller`라는 모듈이 있어요.

[PyInstaller Manual](https://pyinstaller.org/en/stable/)에 따르면,  `pyinstaller`는 Python 애플리케이션 및 실행에 필요한 모든 환경을 하나의 패키지로 묶어줌으로써, 사용자가 Python Interpreter나 모듈을 설치하지 않고 패키지 자체를 실행할 수 있도록 해주는 유틸리티입니다.

파이썬 파일을 실행하기 위해서는 파이썬의 High-level 언어를 Low-level로 변환해주는 **Interpreter**가 필요하고, 또 파이썬 파일 내에서 Load해야 하는 **모듈** 역시 함께 사전에 설치되어야 하는데요.  `pyinstaller`는 이러한 Interpreter와 모듈을 함께 동봉한 채로 파이썬 파일을 패키징하여 하나의 실행 파일로 만들어주는 역할을 하는 것이죠.

![](https://miro.medium.com/v2/resize:fit:1400/0*uKgfsMJQvUG5okP2.jpg)

# 4. `.ipynb` 파일을 `.exe` 파일로 만드는 방법

우선 업무 자동화에 필요한 파이썬 코드를 Jupyter Notebook으로 완성을 합니다.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step01.webp)

사용자가 입력한 정수의 제곱값을 리턴해주는 귀여운 코드를 적어봤어요.

`.ipynb`을 `.py` 형식의 파일로 변환하여 다운로드합니다.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step02.webp)

원하는 경로에 .py 파일을 이동해줍니다.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step03.webp)

이제  `pyinstaller`  모듈을 설치하기 위해 명령 프롬프트를 실행합니다. (Anaconda Powershell Prompt나 Anaconda Prompt가 아닌, Windows 자체의 Command Prompt를 의미해요.)

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step04.webp)

`pyinstaller`  모듈 설치를 위해  `pip install pyinstaller`  명령어를 입력해줍니다.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step05.webp)

이제 명령 환경을 `.py` 파일이 보관되어 있는 디렉토리로 변경해줍니다.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step06.webp)

`pyinstaller --onefile joshua_pyinstaller_practice.py`  명령어를 통해 패키징을 시작합니다. (onefile은 하나의 파일로 패키징해줘야 함을 의미해요!)

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step07.webp)

그런데 가끔(아니 매우 자주), 안타깝게도 프롬프트가  `pyinstaller`라는 명령어를 제대로 이해하지 못하는 경우가 발생해요. 이 경우, 대부분 시스템 환경 변수를 프롬프트가 모르기 때문에 발생합니다.

Windows Task Bar의 검색창에서 `Environment Variables`를 검색하여 시스템 환경 변수 관리 페이지를 실행합니다.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step08.webp)

Advanced 탭 내의 Environment Variables 버튼을 클릭합니다.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step09.webp)

User variables의 New를 클릭합니다.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step10.webp)

잠시 홀드하고, 파이썬이 설치되어 있는 경로를 확인해야 해요. 즉, 파이썬의 Scripts 폴더를 찾아야 하는데요. 보통  `Users\AppData\Local\Programs\Python\Python311`  경로에 Scripts 폴더가 있어요.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step11.webp)

경로를 PATH 이름으로 환경 변수 리스트에 추가해주세요.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step12.webp)

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step13.webp)

이런 환경 설정이 너무 어렵다면, 사실  [Python3 Setup 파일](https://www.python.org/downloads/)을 다시 다운로드하여 Modify하는 방법이 있어요. 그럼 자동으로 환경 변수 세팅을 완료해주거든요.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step14.webp)

Modify를 클릭하세요.

pip 체크 여부를 반드시 확인한 후 Next 버튼을 클릭합니다.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step15.webp)

pip을 꼭 체크해주세요.

Add Python to environment variables를 꼭 체크 후 Install을 진행해주세요.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step16.webp)

그런 후, Add Python to environment variables를 반드시 체크해주세요.

자 이제 다시,  `pyinstaller`  패키징을 시작합니다.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step17.webp)

드디어 성공했군요! 👏

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step18.webp)

`.py` 파일이 보관되어 있는 경로를 찾아가보면, 새로운 폴더와 파일들이 생성된 것을 확인할 수 있습니다. 이 중, 우리가 배포해야 할 실행 파일은 `dist` 폴더에 있으니, `dist` 폴더를 클릭합니다.

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step19.webp)

`.exe` 파일이 생성이 된 것을 확인할 수 있습니다. 한 번 실행해볼까요?

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step20.webp)

잘 실행되네요!😃

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/step21.webp)

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/congratulations.jpeg)

이제 마치 클라이언트 형태로 `.exe` 파일만 배포하면, 파이썬 환경 설치에 대한 부담 없이도 누구나 편리하게 원클릭 업무 자동화를 누릴 수 있답니다!

# 5.  데이터 분석가가 갖추어야 하는 중요한 태도, “떠먹여 드리기”

![]({{ site.baseurl }}/assets/2023-07-15-pyinstaller/feeding.png)

제가 회사에서 동료 분들께 반 농담, 반 진담으로 말씀 드리는 슬로건이 있는데요. 바로 “`떠먹여 드릴게요`”라는 표현입니다.

데이터는 늘 어렵고, 핵심을 꿰뚫이는 더욱 어려운 것 같아요. 데이터 분석가에게도 늘 어려운 일인데, 다른 동료 분들께는 얼마나 더 어려울까요.

**데이터 드리븐 문화**를 위해 함께 데이터를 F/UP해야 하는 동료 분들의 부담을 조금이라도 줄여드리는 Soft한 역량이 데이터 분석가에게 요구되기 때문에, 떠먹여 드리기 위한 노력을 지속적으로 실천하는 것이 정말 중요하다고 생각하는데요. 가만히 누워서 입만 벌리고 계셔도 떠먹여 드릴 수 있는, 그런 데이터 분석가가 되는 것이 제게는 Midterm 목표가 된 것 같습니다.

이런 의미에서 이번 파이썬 클라이언트 개발기는 단순한 개발기 이상으로, 데이터를 업무에 빠르게 반영하여 Pain Point를 손쉽게 해결해드리고자 노력해본 저의 “`떠먹여 드릴게요`” 프로젝트 중 하나였습니다.

떠먹여 드리기도 하고, 저 또한 귀중한 서브 지식들을 함양할 수 있었던 것 같아서 참 뿌듯하기도 했어요. 앞으로 또 어떤  **서브 업무**들이 저를 기다리고 있을까요? 먼 산을 보며 글을 마칩니다. 읽어주셔서 감사합니다.

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)