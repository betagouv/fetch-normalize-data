import 'babel-polyfill'

import { getNormalizedMergedState } from '../getNormalizedMergedState'

describe('src | getNormalizedMergedState', () => {
  describe('default concatenation and replace of entities in the collections when isMergingArray:true isMutatinArray:true isMergingArray: false', () => {

    it('next data state is a new object from previous state', () => {
      // given
      const state = {}
      const patch = {}

      // when
      const nextState = getNormalizedMergedState(state, patch)

      // then
      expect(Object.is(nextState, state)).toBe(false)
    })

    it('next collection array is a new array from previous one', () => {
      // given
      const state = {
        books: []
      }
      const patch = {
        books: []
      }

      // when
      const nextState = getNormalizedMergedState(state, patch)

      // then
      expect(Object.is(nextState, state)).toBe(false)
      expect(Object.is(nextState.books, state.books)).toBe(false)
    })

    it('should concat new entity in the data array', () => {
      // given
      const state = {
        books: [{ id: 0, text: "my foo" }]
      }
      const patch = {
        books: [{ id: 1, text: "you foo" }]
      }
      const expectedNextState = {
        books: [{ id: 0, text: "my foo" }, { id: 1, text: "you foo" }]
      }

      // when
      const nextState = getNormalizedMergedState(state, patch)

      // then
      expect(nextState).toMatchObject(expectedNextState)
      expect(Object.is(nextState, state)).toBe(false)
      expect(Object.is(nextState.foos, state.books)).toBe(false)
      expect(Object.is(nextState.books[0], state.books[0])).toBe(true)
    })

    it('should replace already existing entity in the data array', () => {
      // given
      const state = {
        books: [
          { id: 0, text: "I will be replaced!" }
        ]
      }
      const patch = {
        books: [
          { id: 0, text: "my refreshed foo" },
          { id: 1, text: "you foo" }
        ]
      }
      const expectedNextState = {
        books: [
          { id: 0, text: "my refreshed foo" },
          { id: 1, text: "you foo" }
        ]
      }

      // when
      const nextState = getNormalizedMergedState(state, patch)

      // then
      expect(nextState).toMatchObject(expectedNextState)
      expect(Object.is(nextState, state)).toBe(false)
      expect(Object.is(nextState.foos, state.books)).toBe(false)
      expect(Object.is(nextState.books[0], state.books[0])).toBe(false)
    })
  })

  describe('using mutate and merge configs', () => {

    describe('isMerginArray', () => {
      it('should make the collection replaced when isMerginArray is false', () => {
        // given
        const state = {
          books: [{ id: 0, text: "my foo" }]
        }
        const patch = {
          books: [{ id: 1, text: "you foo" }]
        }
        const expectedNextState = {
          books: [{ id: 1, text: "you foo" }]
        }
        const config = { isMergingArray: false }

        // when
        const nextState = getNormalizedMergedState(state, patch, config)

        // then
        expect(nextState).toMatchObject(expectedNextState)
        expect(Object.is(nextState, state)).toBe(false)
        expect(Object.is(nextState.foos, state.books)).toBe(false)
        expect(Object.is(nextState.books[0], state.books[0])).toBe(false)
      })
    })

    describe('isMutatingArray', () => {
      it('should merge the new collection into the previous one without mutating array when isMutatingArray is false and datum inside are not mutated', () => {
        // given
        const state = {
          books: [{ id: 0, text: "my foo" }]
        }
        const patch = {
          books: [{ id: 1, text: "you foo" }]
        }
        const expectedNextState = {
          books: [
            { id: 0, text: "my foo" },
            { id: 1, text: "you foo" }
          ]
        }
        const config = { isMutatingArray: false }

        // when
        const nextState = getNormalizedMergedState(state, patch, config)

        // then
        expect(nextState).toMatchObject(expectedNextState)
        expect(Object.is(nextState, state)).toBe(false)
        expect(Object.is(nextState.books, state.books)).toBe(true)
        expect(Object.is(nextState.books[0], state.books[0])).toBe(true)
      })
    })

    describe('isMergingDatum', () => {
      it('should mutate and merge already existing entity in the data array when isMergingDatum is true and datum is not mutated', () => {
        // given
        const state = {
          books: [
            { id: 0, notReplacedText: "I will stay alive!", text: "my foo" }
          ]
        }
        const patch = {
          books: [
            { id: 0, mergedText: "I am new here", text: "my refreshed foo" },
            { id: 1, text: "you foo" }
          ]
        }
        const config = { isMergingDatum: true }
        const expectedNextState = {
          books: [
            {
              id: 0,
              mergedText: "I am new here",
              notReplacedText: "I will stay alive!",
              text: "my refreshed foo"
            },
            { id: 1, text: "you foo" }
          ]
        }

        // when
        const nextState = getNormalizedMergedState(state, patch, config)

        // then
        expect(nextState).toMatchObject(expectedNextState)
        expect(Object.is(nextState, state)).toBe(false)
        expect(Object.is(nextState.foos, state.books)).toBe(false)
        expect(Object.is(nextState.books[0], state.books[0])).toBe(true)
      })
    })

    describe('isMutatingDatum', () => {
      it('should mutate and merge already existing entity in the data array when isMergingDatum is true and datum is mutated when isMutatingDatum', () => {
        // given
        const state = {
          books: [
            { id: 0, notReplacedText: "I will stay alive!", text: "my foo" }
          ]
        }
        const patch = {
          books: [
            { id: 0, mergedText: "I am new here", text: "my refreshed foo" },
            { id: 1, text: "you foo" }
          ]
        }
        const config = { isMergingDatum: true, isMutatingDatum: true }
        const expectedNextState = {
          books: [
            {
              id: 0,
              mergedText: "I am new here",
              notReplacedText: "I will stay alive!",
              text: "my refreshed foo"
            },
            { id: 1, text: "you foo" }
          ]
        }

        // when
        const nextState = getNormalizedMergedState(state, patch, config)

        // then
        expect(nextState).toMatchObject(expectedNextState)
        expect(Object.is(nextState, state)).toBe(false)
        expect(Object.is(nextState.foos, state.books)).toBe(false)
        expect(Object.is(nextState.books[0], state.books[0])).toBe(false)
      })
    })
  })

  describe('using normalizer config', () => {
    it('normalize one entity at first level', () => {
      // given
      const state = {
        authors: [{ id: 0, name: "John Marxou" }],
        books: [{ authorId: 0, id: 0, text: "my foo", title: "My foo" }],
        paragraphs: [
          { bookId: 0, id: 0, text: "My foo is lovely." },
          { bookId: 0, id: 1, text: "But I prefer fee." }
        ]
      }
      const patch = {
        books: [
          {
            author: { id: 1, name: "Edmond Frostan" },
            authorId: 1,
            id: 1,
            paragraphs: [
              { bookId: 1, id: 3, text: "Your noise is kind of a rock."}
            ],
            title: "Your noise"
          }
        ]
      }
      const expectedNextState = {
        authors: [
          { id: 0, name: "John Marxou" },
          { id: 1, name: "Edmond Frostan" }
        ],
        books: [
          { authorId: 0, id: 0, title: "My foo" },
          { authorId: 1, id: 1, title: "Your noise" }
        ],
        paragraphs: [
          { bookId: 0, id: 0, text: "My foo is lovely."},
          { bookId: 0, id: 1, text: "But I prefer fee." },
          { bookId: 1, id: 3, text: "Your noise is kind of a rock."}
        ]
      }
      const config = {
        normalizer: {
          books: {
            normalizer: {
              author: "authors",
              paragraphs: "paragraphs"
            },
            stateKey: 'books',
          }
        }
      }

      // when
      const nextState = getNormalizedMergedState(state, patch, config)

      // then
      expect(nextState).toMatchObject(expectedNextState)
    })

    it('normalize entities at deep levels', () => {
      // given
      const state = {
        authors: [
          {
            id: 0,
            name: "John Marxou",
            placeId: 0
          }
        ],
        books: [{
          authorId: 0,
          id: 0,
          text: "my foo",
          title: "My foo"
        }],
        paragraphs: [
          {
            bookId: 0,
            id: 0,
            text: "My foo is lovely."
          },
          {
            bookId: 0,
            id: 1,
            text: "But I prefer fee."
          }
        ],
        places: [
          { address: "11, rue de la Potalerie", city: "Paris", id: 0 }
        ],
        tags: [
          { id: 0, label: "WTF", paragraphId: 0 }
        ]
      }
      const patch = {
        books: [
          {
            author: {
              id: 1,
              name: "Edmond Frostan",
              place: { address: "10, rue de Venise", city: "Vannes", id: 1 },
              placeId: 1,
            },
            authorId: 1,
            id: 1,
            paragraphs: [
              {
                bookId: 1,
                id: 3,
                tags: [
                  { id: 2, label: "un cap", paragraphId: 3 },
                  { id: 3, label: "une péninsule", paragraphId: 3 }
                ],
                text: "Your noise is kind of a rock."
              }
            ],
            title: "Your noise"
          }
        ]
      }
      const expectedNextState = {
        authors: [
          { id: 0, name: "John Marxou", placeId: 0 },
          { id: 1, name: "Edmond Frostan", placeId: 1 }
        ],
        books: [
          { authorId: 0, id: 0, title: "My foo" },
          { authorId: 1, id: 1, title: "Your noise" }
        ],
        paragraphs: [
          { bookId: 0, id: 0, text: "My foo is lovely."},
          { bookId: 0, id: 1, text: "But I prefer fee." },
          { bookId: 1, id: 3, text: "Your noise is kind of a rock."}
        ],
        places: [
          { address: "11, rue de la Potalerie", city: "Paris", id: 0 },
          { address: "10, rue de Venise", city: "Vannes", id: 1 }
        ],
        tags: [
          { id: 0, label: "WTF", paragraphId: 0 },
          { id: 2, label: "un cap", paragraphId: 3 },
          { id: 3, label: "une péninsule", paragraphId: 3 }
        ]
      }
      const config = {
        normalizer: {
          books: {
            normalizer: {
              author: {
                normalizer: {
                  place: "places"
                },
                stateKey: "authors",
              },
              paragraphs: {
                normalizer: {
                  tags: "tags"
                },
                stateKey: "paragraphs",
              }
            },
            stateKey: 'books'
          }
        }
      }

      // when
      const nextState = getNormalizedMergedState(state, patch, config)

      // then
      expect(nextState).toMatchObject(expectedNextState)
    })
  })
})
