# military_services

## `htdocs/`

### Stack
1. Backend
Apache + MySQL + php

2. Frontend
VanillaJS


### Content

#### 1. ISOT
업무 교대 시 병사들이 사용하던 업무 인수인계 페이지
- php 기반의 로그인/로그아웃
- 게시물 statistics를 위한 `profile`
- Card 단위로 운영되는 업무인계 게시판 `HOME`
    - 중요도로 priority를 관리
    - 댓글 기능 구현
    - 공지 기능으로 특정 게시물을 pin 가능
- 특수 정보 관리를 위한 `VAULT`
- 교대 근무표 운영을 위한 `SCHEDULER`
- 각종 회의 지원을 위한 `CALENDER`
- 신속한 정보 검색을 위한 `QUICK MEMO`

#### 2. ISOT_flux (미완성)
module화가 안되어 있는 ISOT 페이지를 개선하기 위한 프로젝트
- 각 component 단위로 modularize
- 중앙화된 정보의 이용이 많다는 점을 고려하여, flux pattern 기반의 data control
    - observe/observer pattern
    - actions & mutations

#### 3. ISOTE (ISOT for Everyone)
- 단순한 게시판에서 나아가, 주기적 업무를 관리하기 위해 routine 기능을 추가
- 주기적 / 비주기적으로 계획된 일을 dashboard에 포함

## `study/`

#### 1. markdown_parser (미완성)
- 부대 내 행정병이 게시글을 더 간편하게 사용할 수 있도록, markdown 문법을 지원하는 editor 제공 목적
- nested list 등이 완벽히 구현되지 않아, 학교 수업을 조금 더 듣고 재시도 예정

#### 2. moondo dodgeball
문도 피구

#### 3. stack
canvas 연습을 위해 stack 게임 구현

#### 4. todo mate
[todo mate](https://play.google.com/store/apps/details?id=com.undefined.mate&hl=en_US)를 인트라넷 상에서 이용하기 위한 copy project

- localStorage 기반의 데이터 저장
- 주기적으로 filesystem에 flush하여 json형태로 데이터를 export
- 다른 컴퓨터에서도 data json과 todo_mate html이 있으면 synchronized된 환경에서 이용 가능