import { getNormalizedActivatedState } from '../getNormalizedActivatedState'

describe('src | getNormalizedActivatedState', () => {
  it('should create an entity through accumulated patches', () => {
    // given
    const state = {}

    const firstDateCreated = new Date().toISOString()
    let lastDateCreated = new Date(firstDateCreated)
    lastDateCreated.setDate(lastDateCreated.getDate() + 1)
    lastDateCreated = lastDateCreated.toISOString()
    const entityIdentifier = 1
    const patch = {
      __activities__: [
        {
          dateCreated: firstDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            value: 1,
          },
        },
        {
          dateCreated: lastDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            value: 2,
          },
        },
      ],
    }

    // when
    const nextState = getNormalizedActivatedState(state, patch)

    // then
    expect(nextState).toStrictEqual({
      __activities__: [
        {
          dateCreated: firstDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            value: 1,
          },
        },
        {
          dateCreated: lastDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            value: 2,
          },
        },
      ],
      foos: [
        {
          activityIdentifier: entityIdentifier,
          dateCreated: firstDateCreated,
          dateModified: lastDateCreated,
          value: 2,
        },
      ],
    })
  })

  it('should delete an entity when met a delete activity', () => {
    // given
    const state = {}

    const firstDateCreated = new Date().toISOString()
    let lastDateCreated = new Date(firstDateCreated)
    lastDateCreated.setDate(lastDateCreated.getDate() + 1)
    lastDateCreated = lastDateCreated.toISOString()
    const entityIdentifier = 1
    const patch = {
      __activities__: [
        {
          dateCreated: firstDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            value: 1,
          },
        },
        {
          dateCreated: lastDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {},
          verb: 'delete',
        },
      ],
    }

    // when
    const nextState = getNormalizedActivatedState(state, patch)

    // then
    expect(nextState).toStrictEqual({
      __activities__: [
        {
          dateCreated: firstDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            value: 1,
          },
        },
        {
          dateCreated: lastDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {},
          verb: 'delete',
        },
      ],
    })
  })

  it('should delete an entity when met a patch.isSoftDeleted activity', () => {
    // given
    const state = {}

    const firstDateCreated = new Date().toISOString()
    let lastDateCreated = new Date(firstDateCreated)
    lastDateCreated.setDate(lastDateCreated.getDate() + 1)
    lastDateCreated = lastDateCreated.toISOString()
    const entityIdentifier = 1
    const patch = {
      __activities__: [
        {
          dateCreated: firstDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            value: 1,
          },
        },
        {
          dateCreated: lastDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            isSoftDeleted: true,
          },
        },
      ],
    }

    // when
    const nextState = getNormalizedActivatedState(state, patch)

    // then
    expect(nextState).toStrictEqual({
      __activities__: [
        {
          dateCreated: firstDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            value: 1,
          },
        },
        {
          dateCreated: lastDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            isSoftDeleted: true,
          },
        },
      ],
    })
  })

  it('should keep array of numeric like before', () => {
    // given
    const entityIdentifier = 1
    const state = {}

    const firstDateCreated = new Date().toISOString()
    const patch = {
      __activities__: [
        {
          dateCreated: firstDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            positions: [
              [0.1, 0.2],
              [0.3, 0.4],
            ],
          },
        },
      ],
    }

    // when
    const nextState = getNormalizedActivatedState(state, patch)

    // then
    expect(nextState).toStrictEqual({
      __activities__: [
        {
          dateCreated: firstDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            positions: [
              [0.1, 0.2],
              [0.3, 0.4],
            ],
          },
        },
      ],
      foos: [
        {
          activityIdentifier: entityIdentifier,
          dateCreated: firstDateCreated,
          dateModified: null,
          positions: [
            [0.1, 0.2],
            [0.3, 0.4],
          ],
        },
      ],
    })
  })
})
