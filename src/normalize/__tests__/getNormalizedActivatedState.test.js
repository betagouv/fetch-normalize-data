import { getNormalizedActivatedState } from '../getNormalizedActivatedState'

describe('src | getNormalizedActivatedState', () => {
  it('should create an entity through accumulated patches', () => {
    // given
    const state = {}

    const entityIdentifier = 1
    const activities = [
      {
        entityIdentifier,
        modelName: 'Foo',
        patch: {
          value: 1,
        },
        stateKey: 'foos',
      },
      {
        entityIdentifier,
        modelName: 'Foo',
        patch: {
          value: 2,
        },
        stateKey: 'foos',
      },
    ]

    // when
    const nextState = getNormalizedActivatedState(state, activities)

    // then
    expect(nextState).toStrictEqual({
      foos: [
        {
          activityIdentifier: entityIdentifier,
          value: 2,
        },
      ],
    })
  })

  it('should keep array of numeric like before', () => {
    // given
    const entityIdentifier = 1
    const state = {}

    const activities = [
      {
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
    ]

    // when
    const nextState = getNormalizedActivatedState(state, activities)

    // then
    expect(nextState).toStrictEqual({
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
})
