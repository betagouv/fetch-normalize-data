<img alt="fetch-normalize-data logo" src="https://raw.githubusercontent.com/betagouv/fetch-normalize-data/master/icon.png" height=60/>

A library to obtain a state of normalized data. Special fetch and reducer helpers are also provided in the export.

An implementation with a redux-thunk context is [here](https://github.com/betagouv/redux-thunk-data), [there](https://github.com/betagouv/redux-thunk-data) for redux-saga. You can see also a poc with only a React Context (redux free) at [this](https://github.com/betagouv/react-hook-data). Also, see this [post](https://medium.com/pass-culture/2-an-open-source-app-94d9de8d6eee) for a presentation based on the pass culture project.

[![CircleCI](https://circleci.com/gh/betagouv/fetch-normalize-data/tree/master.svg?style=svg)](https://circleci.com/gh/betagouv/fetch-normalize-data/tree/master)
[![npm version](https://img.shields.io/npm/v/fetch-normalize-data.svg?style=flat-square)](https://npmjs.org/package/fetch-normalize-data)

## Basic Usage

### Merge
If you want to merge patched data into an already existing state:

```javascript
import { getNormalizedMergedState } from 'fetch-normalize-data'

const state = {
  authors: [{ id: 0, name: "John Marxou" }],
  books: [{ authorId: 0, id: 0, text: "my foo" }]
}

const patch = {
  books: [
    {
      author: { id: 1, name: "Edmond Frostan" },
      id: 1,
      text: "you foo"
    }
  ]
}

const config = {
  normalizer: {
    books: {
      normalizer: {
        // short syntax here: <datumKey>: <stateKey>
        author: "authors"
      },
      stateKey: "books"
    }
  }
}

const nextState = getNormalizedMergedState(state, patch, config)

console.log(nextState)
```

We have:

```javascript
{
  authors: [
    { id: 0, name: "John Marxou" },
    { id: 1, name: "Edmond Frostan" }
  ],
  books: [
    { authorId: 0, id: 0, text: "my foo" },
    {
      authorId: 1,
      id: 1,
      text: "you foo"
    }
  ]
}
```

### Delete
import { getNormalizedDeletedState } from 'fetch-normalize-data'

```javascript
const state = {
  authors: [{ id: 0, name: "John Marxou" }],
  books: [{ authorId: 0, id: 0, text: "my foo" }]
}

const patch = {
  books: [{ id: 1 }]
}

const nextState = getNormalizedDeletedState(state, patch, config)

console.log(nextState)
```

We have:

```javascript
{
  authors: [
    { id: 0, name: "John Marxou" }
  ],
  books: []
}
```

### Usage with config

config of getNormalizedMergedState can have:

| name | type | example | isRequired | default | description |
| -- | -- | -- | -- | -- | -- |
| isMergingArray | bool | [See test](https://github.com/betagouv/fetch-normalize-data/blob/887323e6146d5eec40203b4f4b692bfcb65a4cd9/src/tests/getNormalizedMergedState.spec.js#L92) | non | `true` | decide if nextState.<arrayName> will be a merge of previous and next data or just a replace with the new array |
| isMergingDatum | bool | [See test](https://github.com/betagouv/fetch-normalize-data/blob/master/src/tests/getNormalizedMergedState.spec.js#L145) | non | `false` | decide if `nextState.<arrayName>[...<datum>]` will be a merge from previous and next datum or just a replace with next datum |
| isMutatingArray | bool | [See test](https://github.com/betagouv/fetch-normalize-data/blob/master/src/tests/getNormalizedMergedState.spec.js#L117) | non | `true` | decide if nextState.<arrayName> will be a concat or a merge from previous array |
| isMutatingDatum | bool | [See test](https://github.com/betagouv/fetch-normalize-data/blob/master/src/tests/getNormalizedMergedState.spec.js#L183) | non | `false` | decide if `nextState.<arrayName>[...<datum>]` will be a clone or a merge into the previous datum |
| normalizer | objet | [See test](https://github.com/betagouv/fetch-normalize-data/blob/master/src/tests/getNormalizedMergedState.spec.js#L280) | non | `null` | a nested object giving relationships between datumKeys and entities to be store at stateKeys |

## Fetch usage

### fetchData

| name | type | example | isRequired | default | description |
| -- | -- | -- | -- | -- | -- |
| apiPath | `string` | `/foos` | no | `undefined` | apiPath will be join with rootUrl to build the request url |
| handleFail | `function(state, action)` | TBP | no | `undefined` | callback called if request has failed |
| handleSuccess | `function(state, action)` | TBP | no | `undefined` | callback called if request is a success |
| method | `STRING` | `POST` | no | 'GET' | http method for the request |
| stateKey | `string` | `foos` | no | `<computed from apiPath or url>` | key into the `store.getState().data.<stateKey>` where normalized merged or deleted data will be applied |
| url | `string` | `https://momarx.com/foos` | no | `undefined` | total url of the request that will be used if apiPath is not used |

## Reducer usage

fetch-normalize-data can play mainly with 3 types of actions:
  - `REQUEST_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)`
  - `SUCCESS_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)`
  - `FAIL_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)`

The action creator requestData is almost the only one you will need
to use for fetching data at mount time or at event mutation time.

### requestData

You can play with actions, but you need a special installation given the async action handler you take in your app:

See for example an example with https://github.com/betagouv/redux-saga-data, but global use is like:

```
import { requestData } from 'fetch-normalize-data'

const config = {
  apiPath: '/foos',
  normalizer: {
    'bar': {
      stateKey: 'bars'
    }
  }
}

store.dispatch(requestData(config))
```

where config is all the possible config parameters you can find in
config of `getNormalizedMergedState` or in the config of `fetchData`.
