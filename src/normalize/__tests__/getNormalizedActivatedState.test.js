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
          stateKey: 'foos',
        },
        {
          dateCreated: lastDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            value: 2,
          },
          stateKey: 'foos',
        },
      ],
      foos: [
        {
          activityIdentifier: entityIdentifier,
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
          stateKey: 'foos',
        },
        {
          dateCreated: lastDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {},
          verb: 'delete',
          stateKey: 'foos',
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
          stateKey: 'foos',
        },
        {
          dateCreated: lastDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            isSoftDeleted: true,
          },
          stateKey: 'foos',
        },
      ],
    })
  })

  it('should keep items of the entity not related to activity', () => {
    // given
    const entityIdentifier = 1
    const state = {
      foos: [
        {
          activityIdentifier: entityIdentifier,
          notDisappearedValue: 'hello',
          value: 2,
        },
      ],
    }

    const firstDateCreated = new Date().toISOString()
    let lastDateCreated = new Date(firstDateCreated)
    lastDateCreated.setDate(lastDateCreated.getDate() + 1)
    lastDateCreated = lastDateCreated.toISOString()
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
          stateKey: 'foos',
        },
      ],
      foos: [
        {
          activityIdentifier: entityIdentifier,
          notDisappearedValue: 'hello',
          value: 1,
        },
      ],
    })
  })

  it('should keep array of numeric like before', () => {
    // given
    const entityIdentifier = 1
    const state = {
      foos: [
        {
          activityIdentifier: entityIdentifier,
        },
      ],
    }

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
          stateKey: 'foos',
        },
      ],
      foos: [
        {
          activityIdentifier: entityIdentifier,
          positions: [
            [0.1, 0.2],
            [0.3, 0.4],
          ],
        },
      ],
    })
  })

  it('should overide an array of numeric', () => {
    // given
    const entityIdentifier = 1
    const firstDateCreated = new Date().toISOString()
    const state = {
      __activities__: [
        {
          dateCreated: firstDateCreated,
          entityIdentifier,
          localIdentifier: `0/${firstDateCreated}`,
          modelName: 'Foo',
          patch: {
            positions: [
              [0.1, 0.2],
              [0.3, 0.4],
            ],
          },
          stateKey: 'foos',
        },
      ],
      foos: [
        {
          activityIdentifier: entityIdentifier,
        },
      ],
    }
    const secondDateCreated = new Date().toISOString()
    const patch = {
      __activities__: [
        {
          dateCreated: secondDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            positions: [
              [0.9, 0.8],
              [0.7, 0.6],
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
          dateCreated: secondDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            positions: [
              [0.9, 0.8],
              [0.7, 0.6],
            ],
          },
          stateKey: 'foos',
        },
      ],
      foos: [
        {
          activityIdentifier: entityIdentifier,
          positions: [
            [0.9, 0.8],
            [0.7, 0.6],
          ],
        },
      ],
    })
  })

  it('should force to not save activities with same dateCreated', () => {
    // given
    const entityIdentifier = 1
    const state = {
      foos: [],
    }

    const firstDate = new Date()
    const firstDateCreated = firstDate.toISOString()
    const patch = {
      __activities__: [
        {
          dateCreated: firstDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            textA: 'bar',
          },
        },
        {
          dateCreated: firstDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            textB: 'bir',
          },
        },
        {
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            textC: 'bor',
          },
        },
      ],
    }

    // when
    const nextState = getNormalizedActivatedState(state, patch)

    // then
    const secondDateCreated = new Date(firstDate.getTime() + 1).toISOString()
    expect(nextState).toStrictEqual({
      __activities__: [
        {
          dateCreated: firstDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            textA: 'bar',
          },
          stateKey: 'foos',
        },
        {
          dateCreated: secondDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            textB: 'bir',
          },
          stateKey: 'foos',
        },
        {
          dateCreated: nextState.__activities__[2].dateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            textC: 'bor',
          },
          stateKey: 'foos',
        },
      ],
      foos: [
        {
          activityIdentifier: entityIdentifier,
          textA: 'bar',
          textB: 'bir',
          textC: 'bor',
        },
      ],
    })
  })
})
