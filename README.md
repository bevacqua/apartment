# apartment

> remove undesirable properties from a piece of css

# motivation

tools like `penthouse` don't really care about specific properties, but if you have critical content with css rules such as `animation` or `transition`, you might end up with a lot more css than what you actually need to inline in your pages.

# install

```shell
npm install apartment --save
```

# examples

using the api:

```js
apartment('.foo{font-size:12px;font-weight:bold}', { properties: 'font-size' })
// <- '.foo{font-weight:bold}'
apartment('.foo{font-size:12px;}', { properties: 'font-size' })
// <- ''
```

using the cli:

```shell
$ echo '.foo{font-size:12px;font-weight:bold}' | apartment -p font-size
> .foo{font-weight:bold}
$ echo '.foo{font-size:12px;}' | apartment -p font-size
>
```

# testing

```shell
npm test
```

# license

mit
