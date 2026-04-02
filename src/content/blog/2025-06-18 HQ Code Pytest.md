---
title: 'High-Quality Code with PyTest: Managing Complexity in Python Applications'
description: 'Advanced PyTest guide for testing complex Python apps: structure tests, use JSON data, manage mocks and dependencies for clean, maintainable code.'
pubDate: 'Jun 18 2025'
heroImage: '../../assets/Computer-with-python.png'
---

In this article, I am going to discuss some of the best practices for PyTest to maintain high-quality source code inside complex applications. This article assumes a good grasp of the Python programming language with versions 3.10+ and of the PyTest framework. This article will neither go through the basics of PyTest nor the basics or advanced features of Python 3.10+. However, you can find pretty good and interesting articles online, including here on Medium. And always online you can find the [GitHub Repository](https://github.com/marcopetri98/article-medium-pytest-code-quality) with all the codes of this post. We will not be discussing fixtures, performance tests, plugins, SonarQube, linting, or other tools; we will see some practices that will enhance your tests. In order to simplify reading, I’d like to structure here a table of contents:

#### Table of contents

* _Project structure_
* _Adding test cases_
* _Parametrize tests_
* _Parametrization and user-defined objects_
* _Dependencies between tests_
* _Integration tests_
* _Conclusion_

#### Project structure

If you jumped upon this article, you should not be an absolute beginner in software development. You might well know what I mean by complex applications. However, I think it is valuable to define what could be considered a complex application: software that is built by a team composed of several people, whose architecture spans several resources, has thousands of real lines of code, and multiple components that interact with each other. These are all characteristics of complex applications. Even though there is no strict definition of what is complex and what is simple, you probably grasp the idea.

Now that we know what we are talking about, we can go much more into the details of how to properly write automated tests using PyTest and how to ensure high quality source code. The first best practice for ensuring high-quality code with PyTest is to adopt a rigorous testing approach. For instance, I suggest using Test-Driven Development (TDD), which means that we will write tests before actually implementing a function, and then we will implement it to make the tests pass. In this approach, tests guarantee that requirements are satisfied.

Next, we want to approach TDD in the right way. Our goal is not to simply put hundreds of tests in our Python files; we aim at building a highly efficient and maintainable way of writing tests.

Therefore, we need to distinguish between unit, integration, and system tests in our project, and we have to structure the repository to reflect this in a simple and obvious way. Moreover, there will be pre-commit configuration files to ensure that linting and basic sanity checks are performed on the code before being pushed to the remote, as well as the dependency management tool files (e.g., Poetry in dependency management mode). A possible structure could be:

```
root/
├── docs/
├── infrastructure/
├── yourpackage/
├── tests/
│   ├── data/
│   ├── integration/
│   ├── unit/
│   ├── system/
│   └── __init__.py
├── .gitignore
├── .gitattributes
├── .pre-commit-config.yaml
├── poetry.lock
├── pyproject.toml
├── README.md
```

It is important to distinguish different levels of tests, from unit to system. It is up to you and your team to structure your repository; however, I strongly suggest defining the structure prior to the start of development activities so that the project starts with well-known development rules for easier collaboration.

As you can see, the tests package contains a folder called data. Here, you would like to add your test data that will be used for all parameterized tests. Yes, parameterized does not simply mean using the PyTest `@parametrized` decorator with a bunch of hardcoded values, as you can see in beginners’ tutorials. You need a structured way to retrieve the values to be used for testing your function.

#### Adding test cases

Let’s create some simple functions over which we will add PyTest to ensure high quality. These examples are simple on purpose. You would never implement such simple functions in Python, as there is no need for them. However, I think that keeping the basics simple will help you understand the complexities of PyTest. Consider these as examples (file called `simple.py` under `yourpackage`):

```python
def sum_ints(a: int, b:int) -> int:
    return a + b

def percentage(value: int, total: int) -> float:
    return value / total

def sum_list_ints(values: list[int]) -> int:
    res = 0
    for x in values:
        res = sum_ints(res, x)
    return res

def is_over_50_perc(value: int, values: list[int]) -> bool:
    sum_ = sum_list_ints(values)
    perc = percentage(value, sum_list_ints(values))

    return True if perc > 0.5 and sum_ != 0 else False
```

We can identify four different functions, two of which depend on the others. Here, we need to distinguish between unit and integration tests. A unit test should test the unit itself independently of other units; an integration test would verify that it works along with other functions. A clear distinction is that a unit test typically uses a white-box approach, whereas an integration test is more like a grey-box approach. What we would treat as fully black-box testing would be a system test. So, how could we test those functions? Let’s start without parametrization and all optimizations (file called `test_simple.py` under `tests.unit`):

```python
from unittest.mock import Mock, patch

from yourpackage.simple import sum_ints, percentage, sum_list_ints, is_over_50_perc


def test_sum_ints():
    a, b = 4, 5
    res = sum_ints(a, b)
    assert res == a + b

def test_percentage():
    value, total = 30, 100
    res = percentage(value, total)
    assert res == 0.3

def test_sum_list_ints():
    sum_mock = Mock(side_effect=lambda x, y: x + y)

    with patch("article.simple.sum_ints", sum_mock):
        list_ = [5, 10, 15, 20]
        res = sum_list_ints(list_)
        assert res == 50

def test_is_over_50_perc():
    sum_list_mock = Mock(side_effect=sum)
    perc_mock = Mock(side_effect=lambda x, y: x / y)

    with (patch("article.simple.sum_list_ints", sum_list_mock),
          patch("article.simple.percentage", perc_mock)):
        value = 10
        list_ = [5, 10, 15, 20]
        res = is_over_50_perc(value, list_)
        assert res == False
```

As you can see, we have created mocks to implement the unit tests. However, there are some problems: all parameters are hardcoded inside the tests, and mocks are hardcoded. The first problem can be solved easily by properly using `@parametrized` and loading the inputs and expected outputs from files. The second is more subtle. Here, the mocks are created manually and injected. In this case, it is not much of a problem; however, when you have many dependencies, it might be problematic to mock them manually. If you are facing a situation in which your tested module has several dependencies, you should ask yourself: is it time to refactor the module?

#### Parametrize tests

Let’s start by making our modules load inputs from files:

```python
from unittest.mock import Mock, patch

import pytest

from yourpackage.simple import sum_ints, percentage, sum_list_ints, is_over_50_perc
from tests.helper import load_test_data


@pytest.mark.parametrize(
    "data,expected_output", load_test_data(__name__)["test_sum_ints"]
)
def test_sum_ints(data: dict, expected_output: dict):
    res = sum_ints(data["first"], data["second"])
    assert res == expected_output["result"]


@pytest.mark.parametrize(
    "data,expected_output", load_test_data(__name__)["test_percentage"]
)
def test_percentage(data: dict, expected_output: dict):
    res = percentage(data["value"], data["percentage"])
    assert res == expected_output["result"]


@pytest.mark.parametrize(
    "data,expected_output", load_test_data(__name__)["test_sum_list_ints"]
)
def test_sum_list_ints(data: dict, expected_output: dict):
    sum_mock = Mock(side_effect=lambda x, y: x + y)

    with patch("article.simple.sum_ints", sum_mock):
        res = sum_list_ints(data["list"])
        assert res == expected_output["result"]


@pytest.mark.parametrize(
    "data,expected_output", load_test_data(__name__)["test_is_over_50_perc"]
)
def test_is_over_50_perc(data: dict, expected_output: dict):
    sum_list_mock = Mock(side_effect=sum)
    perc_mock = Mock(side_effect=lambda x, y: x / y)

    with (
        patch("article.simple.sum_list_ints", sum_list_mock),
        patch("article.simple.percentage", perc_mock),
    ):
        res = is_over_50_perc(data["value"], data["list"])
        assert res == expected_output["result"]
```

Now, we have parameterized all inputs to our tested functions and their outputs. This way, the tests only need to orchestrate the checks on the test data without having to bother with containing the actual test data. This greatly simplifies the testing procedures, as we can differentiate between test logic and test data. However, what is the `load_test_data` function? Why do we give it the value of the dunder `__name__` variable? This function is a utility that helps you fetch the test data by maintaining the same structure in tests. Using this pattern, you minimize the number of variable parameters that you need to provide. This is its implementation (file called `helper.py` under `tests`):

```python
import json
from pathlib import Path


def load_test_data(module: str) -> dict:
    sub_path = module.split(".", maxsplit=1)[1]
    sub_path = sub_path.replace(".", "/")
    sub_path = sub_path + ".json"
    json_path = Path(__file__).parent / "data" / sub_path

    if not json_path.exists() or not json_path.is_file():
        raise ValueError(
            f"The json test data ({json_path}) for module {module} does not exist"
        )

    content = json_path.read_text()

    loaded_dict = json.loads(content)

    return loaded_dict
```

As you can see, this method reads a JSON file, which means that complex Python types such as classes won’t be translated in any way. Moreover, you might also want to test classes in which you would like to handle dependencies between tests. For instance, if a class `__init__` method is broken, you might want to skip all other method tests, as they will be broken anyway and you would waste computation time. In complex codebases, you could save seconds or even minutes by avoiding the execution of some tests based on dependencies, which means lower execution costs if you use cloud machines for evaluating your tests.

#### Parametrization and user-defined objects

Let’s see an example in which you have a class with a method and an `__init__` method, where the method takes as input a `dataclass` and outputs a different `dataclass`. Consider this class (file called `complex.py` under `yourpackage`):

```python
from dataclasses import dataclass


@dataclass
class TwoNums(object):
    first: int
    second: int


@dataclass
class NumsAndDerivate(object):
    two_nums: TwoNums
    nums_sum: float


class NumSummer(object):
    def __init__(self, factor: float):
        super().__init__()

        self.factor = factor

    def derive(self, nums: TwoNums) -> NumsAndDerivate:
        derivation = (nums.first + nums.second) * self.factor

        return NumsAndDerivate(two_nums=nums, nums_sum=derivation)
```

In order to test such a class, we would need to parameterize complex objects such as user-defined classes. Therefore, we might consider that JSON is not appropriate. However, we still want to make our test data independent of the tests’ source code. There is actually a way to specify in JSON how to create an object. We can use the unpacking operator to pass all arguments to a method. Therefore, if we know the class (we have this information) and the values of its parameters (we know those too), we can modify the previous method to read the JSON so that if a sentinel is encountered, an object will be created.

Now things start to get complex; therefore, we need to ensure that the code is extensible in the future to allow easy refactoring and we modify the `helper.py`:

```python
import importlib
import json
from copy import deepcopy
from pathlib import Path
from typing import Any


CLASS_SENTINEL = "__class"
CLASS_MODE = "__mode"
CLASS_MODE_UNPACK = "unpack"
CLASS_MODE_MODES = [CLASS_MODE_UNPACK]
CLASS_IMPORT = "__import"


def sanitize_dict_for_objects(obj: Any) -> Any:
    """Convert a dictionary with class sentinel to actual class.

    A dictionary that contains the class sentinel with a valid instantiation
    method and a valid full module path to the class will be converted to the
    actual class.

    If the object is a ``list``, ``set``, or ``tuple`` every element of the
    iterable will be checked for this.

    If it is a generic object that is neither a dictionary nor an iterable, it
    will be simply returned.

    Args:
        obj: The object to be sanitized.

    Returns:
        Dictionary converted to real project objects using sentinels.
    """
    if isinstance(obj, dict):
        for key, value in obj.items():
            obj[key] = sanitize_dict_for_objects(value)

        if CLASS_SENTINEL not in obj.keys():
            return obj

        try:
            unpacking = obj[CLASS_SENTINEL][CLASS_MODE]
            module: str = obj[CLASS_SENTINEL][CLASS_IMPORT]
        except KeyError as e:
            raise ValueError("The json test data are broken. Structure is not respected") from e

        if unpacking not in CLASS_MODE_MODES:
            raise ValueError(f"Mode {unpacking} is not supported in json test data")

        if unpacking == CLASS_MODE_UNPACK:
            module_name, class_name = module.rsplit(".", maxsplit=1)
            class_module = importlib.import_module(module_name)
            klass = getattr(class_module, class_name)

            clean_obj = deepcopy(obj)
            del clean_obj[CLASS_SENTINEL]
            klass_obj = klass(**clean_obj)
            return klass_obj

    if isinstance(obj, list) or isinstance(obj, set) or isinstance(obj, tuple):
        # sanitize all iterable elements
        new_list = []
        for e in obj:
            new_list.append(sanitize_dict_for_objects(e))
        return type(obj)(new_list)
    else:
        return obj


def load_test_data(module: str) -> dict:
    sub_path = module.split(".", maxsplit=1)[1]
    sub_path = sub_path.replace(".", "/")
    sub_path = sub_path + ".json"
    json_path = Path(__file__).parent / "data" / sub_path

    if not json_path.exists() or not json_path.is_file():
        raise ValueError(
            f"The json test data ({json_path}) for module {module} does not exist"
        )

    content = json_path.read_text()

    loaded_dict = json.loads(content)
    sanitized_dict = sanitize_dict_for_objects(loaded_dict)

    return sanitized_dict
```

Note that I also added a line inside the loading method to ensure that the returned dictionary contains Python objects. However, now that we are given this piece of code, we need to consider one thing: how hard and complex is this JSON now? Here it is:

```json
{
  "test_init": [
    [
      {
        "factor": 5
      },
      {
      }
    ]
  ],
  "test_derive": [
    [
      {
        "nums": {
          "__class": {
            "__mode": "unpack",
            "__import": "article.complex.TwoNums"
          },
          "first": 10,
          "second": 20
        }
      },
      {
        "result": {
          "__class": {
            "__mode": "unpack",
            "__import": "article.complex.NumsAndDerivate"
          },
          "two_nums": {
            "__class": {
              "__mode": "unpack",
              "__import": "article.complex.TwoNums"
            },
            "first": 10,
            "second": 20
          },
          "nums_sum": 20
        }
      }
    ]
  ]
}
```

Yes, I admit, it is a bit long. However, this might come in handy when you have deeply nested objects, where specifying the inputs directly inside your Python code and storing such elements inside one or multiple Python variables could severely increase the length and complexity of such structures. For sure, nothing is perfect, and you can find downsides to this approach: when you refactor the class by changing its name, the import won’t change. However, the test will fail appropriately, and you will notice that. If you don’t need objects to be instantiated through the loading phase, another great approach could be manually creating the object by using the parameters given as input. This means you could completely discard the previous code and keep it simple:

```json
{
  "test_init": [
    [
      {
        "factor": 5
      },
      {
      }
    ]
  ],
  "test_derive": [
    [
      {
        "nums": {
          "first": 10,
          "second": 20
        }
      },
      {
        "result": {
          "two_nums": {
            "first": 10,
            "second": 20
          },
          "nums_sum": 20
        }
      }
    ]
  ]
}
```

Then, given this much simpler and more understandable JSON, you could easily read those objects inside a test of yours with:

```python
@pytest.mark.parametrize(
    "data,expected_output", load_test_data(__name__)["test_mytest"]
)
def test_mytest(data: dict, expected_output: dict):
    two_nums = TwoNums(**data["nums"])
    expected_output = NumsAndDerivate(
        TwoNums(**expected_output["result"]["two_nums"]),
        nums_sum=expected_output["result"]["nums_sum"],
    )
    assert two_nums == expected_output.two_nums
```

It is up to you what to choose. In general, if there are no specific requirements to create objects directly from the JSON, I suggest you follow this latter approach because of its simplicity in writing test cases in JSON. Moreover, if you don’t like JSON, you can choose a different format such as YAML, since here we are simply specifying strings and numbers.

#### Dependencies between tests

Now, besides parameterizing tests, an important topic is dependencies between tests and their relative ordering. Suppose we have a unit test that has failed. Would we want to run our integration tests? Obviously not. There is no need to run integration tests, which take time, if the unit tests themselves are not correct.

First, let’s see how we can specify dependencies. We will need to test our class. We would like to test our `__init__` method; if it succeeds, we would like to continue the tests. To do so, we need to add the `pytest-dependency` package to our project, as it enables us to specify dependencies. Then, we need to write those tests (here I used the JSON version to create objects directly from the JSON — file called `test_complex.py` under `tests.unit`):

```python
import pytest

from yourpackage.complex import NumSummer
from tests.helper import load_test_data, parametrized_instances


@pytest.mark.dependency()
@pytest.mark.parametrize(
    "data,expected_output", load_test_data(__name__)["test_derive"]
)
def test_init(data: dict, expected_output: dict):
    obj = NumSummer(data["factor"])
    assert isinstance(obj, NumSummer)


@pytest.mark.dependency(depends=(parametrized_instances("test_init", test_init)))
@pytest.mark.parametrize(
    "data,expected_output", load_test_data(__name__)["test_derive"]
)
def test_derive(data: dict, expected_output: dict):
    summer = NumSummer(data["factor"])
    res = summer.derive(data["nums"])
    assert res == expected_output["result"]
```

Here, we have created two tests on which a dependency can be injected. However, as we can see, the second depends on the first. The reason we do not have the possibility to directly state the name of the test on which we are dependent is that parametrization creates several tests under the hood. Therefore, we need a helper function that gives us the names of all those cases (because we want to depend on all its cases). Alternatively, we could specify a dependency only on a subset of the tested values. The implementation of the helper function involves inspecting the object handled by `pytest.mark`, which produces the following `helper.py` addition:

```python
def parametrized_instances(name: str, marked_func) -> list[str]:
    for mark in vars(marked_func)["pytestmark"]:
        if mark.name == "parametrize":
            arguments = mark.args[0].split(",")
            num_tests = len(mark.args[1])
            break
    else:
        raise ValueError("There is a code error inside tests")

    return [
        f"{name}[{'-'.join([e + str(idx) for e in arguments])}]"
        for idx in range(num_tests)
    ]
```

Now, you should have a good understanding of parameterization and dependencies between tests. Let’s move on to the last topic of the article: the order of tests.

#### Integration tests

We have implemented all of our unit tests. Moreover, we know how to specify dependencies between integration tests, such that an integration test is not run when another integration test on which it depends has not passed, and we know how to avoid unit testing methods of objects if their `__init__` function does not work. Now, implement the integration tests of our code (file called `test_simple.py` under `tests.integration`):

```python
import pytest

from yourpackage.simple import sum_list_ints, is_over_50_perc
from tests.helper import load_test_data, parametrized_instances


@pytest.mark.dependency()
@pytest.mark.parametrize(
    "data,expected_output", load_test_data(__name__)["test_it_sum_list_ints"]
)
def test_it_sum_list_ints(data: dict, expected_output: dict):
    res = sum_list_ints(data["list"])
    assert res == expected_output["result"]


@pytest.mark.dependency(depends=(parametrized_instances("test_it_sum_list_ints", test_it_sum_list_ints)))
@pytest.mark.parametrize(
    "data,expected_output", load_test_data(__name__)["test_it_is_over_50_perc"]
)
def test_it_is_over_50_perc(data: dict, expected_output: dict):
    res = is_over_50_perc(data["value"], data["list"])
    assert res == expected_output["result"]
```

As you can see here, we do not need mocks anymore. But why? This is because I decided to use the bottom-up approach for testing, which frees me from the burden of creating stubs. The dependency between our integration tests is very important, as the second test won’t work if the first one stops working. However, if you try to simply run pytest over our tests folder, you would try to run both unit and integration tests. We clearly do not want that. Instead of marking each unit test and integration test, we can leverage the directory organization of our project. Since unit and integration tests are placed in different folders, we can first execute all unit tests, and only if those succeed will we run integration tests. To do so, we can write a simple Bash script that will execute the unit tests, and if any of them fail, it will print out the failed results; otherwise, it will continue with the integration tests.

```sh
#!/bin/bash

UNIT_TEST_DIR="./tests/unit"
INTEGRATION_TEST_DIR="./tests/integration"

echo "Running unit tests..."
poetry run pytest "$UNIT_TEST_DIR" > unit_test_output.txt 2>&1

if grep -q "FAILED" unit_test_output.txt; then
    echo "Some unit tests failed. Check the output that will be pasted here."
    cat unit_test_output.txt
    exit 1
else
    echo "All unit tests passed."

    echo "Running integration tests..."
    poetry run pytest "$INTEGRATION_TEST_DIR" > integration_test_output.txt 2>&1

    if grep -q "failed" integration_test_output.txt; then
        echo "Some integration tests failed. Check integration_test_output.txt for details."
        cat integration_test_output.txt
        exit 1
    else
        echo "All integration tests passed."
    fi
fi
```

#### Conclusion

This article ends here. I hope you have learned something useful for your development best practices. You can now perform efficient testing as well as set up simple Bash scripts to run unit and integration tests conditionally. Optionally, you may want to set up CI/CD pipelines to verify this, but this is not the place for that content.

Thank you for your attention!