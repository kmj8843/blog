---
title: 'Mkdocs 사용방법'
---

# Mkdocs Material

이 블로그는 `MkDocs`[^1]와 `Material for MkDocs`[^2] 테마를 사용해서 만들어졌습니다.

[^1]: [MkDocs](https://www.mkdocs.org/)

[^2]: [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)

## 시작하기

MkDocs 는 Python 기반의 정적 사이트 생성기로, Markdown 파일을 HTML로 변환하여 블로그나 문서 사이트를 쉽게 만들 수 있습니다.
Python 을 활용하기 위해서 선택적으로 가상 환경을 설정할 수 있습니다.

```bash
# 개발 환경을 위한 가상 환경 생성
# 가상환경 생성은 선택 사항
# python -m venv venv

# Mkdocs Material 설치
# pip install mkdocs mkdocs-material

# 가상 환경 활성화
source venv/bin/activate

# 필요한 패키지 설치
pip install -r requirements.txt

# Mkdocs 실행
mkdocs serve
```

## Formatter

결과를 출력하기 위해 `<div class="result" markdown>` 태그를 사용할 경우 `<div>` 와 `</div>` 사이에 공백을 두어야 prettier 가 제대로 동작합니다:

<!-- prettier-ignore-->
````html
<div class="result" markdown>
<!-- 공백 -->
```py title="bubble_sort.py" linenums="1" hl_lines="2 3"
def bubble_sort(items): # (1)
    for i in range(len(items)):
        for j in range(len(items) - 1 - i):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]

```

1. I'm a code annotation! I can contain `code`, **formatted text**,
   images, ... basically anything that can be written in Markdown.
<!-- 공백 -->
</div>
````

또한, auto format 을 원하지 않는 경우 `<!-- prettier-ignore-->` 를 사용하여 다음 라인의 format 을 무시할 수 있습니다.

## Code Block

Code Block[^3] 은 MkDocs Material 테마에서 코드 블록을 표시하는 방법입니다. 다양한 프로그래밍 언어를 지원하며, 코드 하이라이팅과 라인 번호, 강조 표시 등을 제공합니다.

[^3]: [MkDocs Material - Code Block](https://squidfunk.github.io/mkdocs-material/reference/code-blocks/?h=code+block)

````markdown title="Code block with title"
```py title="bubble_sort.py" linenums="1" hl_lines="2 3"
def bubble_sort(items): # (1)
    for i in range(len(items)):
        for j in range(len(items) - 1 - i):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]

1.  :man_raising_hand: I'm a code annotation! I can contain `code`, **formatted
    text**, images, ... basically anything that can be written in Markdown.
```
````

<div class="result" markdown>

```py title="bubble_sort.py" linenums="1" hl_lines="2 3"
def bubble_sort(items): # (1)
    for i in range(len(items)):
        for j in range(len(items) - 1 - i):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]

```

1. I'm a code annotation! I can contain `code`, **formatted text**,
   images, ... basically anything that can be written in Markdown.

</div>

## ✅ 설명

| YAML 필드    | 설명                                                      |
| ------------ | --------------------------------------------------------- |
| `title`      | 글 제목 (사이드바/목록에 표시됨)                          |
| `date`       | 포스트 날짜 (정렬 기준)                                   |
| `categories` | 분류용 카테고리. `categories_allowed:`에 명시된 값만 유효 |
| `tags`       | 태그 목록. `tags` 플러그인으로 필터링 가능                |
| `summary`    | 일부 테마/플러그인에서 미리보기 텍스트로 사용됨           |

> `---` 사이의 구역은 **YAML frontmatter**라고 하며, 블로그 메타데이터로 사용됩니다.

## 🚀 MkDocs 실행

```bash
mkdocs serve
```

---

## ✅ 폴더 구조 예시

```
docs/
└── blog/
├── index.md
├── 2025-07-14-my-first-post.md
└── 2025-07-15-another-post.md
```

파일명은 날짜-슬러그 형태(`YYYY-MM-DD-slug.md`)로 하면 대부분의 blog 플러그인에서 잘 정렬됩니다.

---

## ✅ 추가 팁

- 여러 카테고리/태그도 가능 (`tags:`에 2~3개 이상)
- 카테고리나 태그 링크는 자동으로 `tags/`, `categories/` 페이지에 생성됨
- 포스트 내부에서 이미지 넣고 싶다면 `docs/images/` 아래에 저장하고 상대 경로로 삽입 가능

```md
![예시 이미지](../images/sample.png)
```

---

## 기타 사용 방법

툴팁 예시
[Hover me](https://example.com "I'm a tooltip!")

[test]
[test]: ../index.md#asd

이미지 삽입 예시
![Image title](https://dummyimage.com/600x400/eee/aaa)

---

### content tabs

=== "C"

    ``` c
    #include <stdio.h>

    int main(void) {
      printf("Hello world!\n");
      return 0;
    }
    ```

=== "C++"

    ``` c++
    #include <iostream>

    int main(void) {
      std::cout << "Hello world!" << std::endl;
      return 0;
    }
    ```

!!! example

    === "Unordered List"

        ``` markdown
        * Sed sagittis eleifend rutrum
        * Donec vitae suscipit est
        * Nulla tempor lobortis orci
        ```

    === "Ordered List"

        ``` markdown
        1. Sed sagittis eleifend rutrum
        2. Donec vitae suscipit est
        3. Nulla tempor lobortis orci
        ```

---

## 📝 코드 예시

```py title="bubble_sort.py" linenums="1" hl_lines="2 3"
def bubble_sort(items):
    for i in range(len(items)):
        for j in range(len(items) - 1 - i):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]
```

```yaml
theme:
  features:
    - content.code.annotate # (1)
```

1.  :man_raising_hand: I'm a code annotation! I can contain `code`, **formatted
    text**, images, ... basically anything that can be written in Markdown.

---

## 📦 코드 샌드박스 예시

<iframe src="https://codesandbox.io/embed/new?view=editor+%2B+preview&module=%2Fsrc%2FApp.js"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="React"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

## Reference

- [SVG (icon)](https://www.svgrepo.com/)
- [SVG (image)](https://undraw.co/)
- [Animation SVG](https://storyset.com/)

```

```
