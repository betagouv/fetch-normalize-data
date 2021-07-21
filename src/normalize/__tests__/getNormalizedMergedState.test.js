import { getNormalizedMergedState } from '../getNormalizedMergedState'

describe('src | getNormalizedMergedState', () => {
  describe('default concatenation and replace of entities in the collections when isMergingArray:true isMutatinArray:true isMergingArray: false', () => {
    it('should make a next data state as a new object from the previous state', () => {
      // given
      const state = {}
      const patch = {}

      // when
      const nextState = getNormalizedMergedState(state, patch)

      // then
      expect(Object.is(nextState, state)).toBe(false)
    })

    it('should make a next collection array with a new array from previous one', () => {
      // given
      const state = {
        books: [],
      }
      const patch = {
        books: [],
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
        books: [{ id: 0, text: 'my foo' }],
      }
      const patch = {
        books: [{ id: 1, text: 'you foo' }],
      }

      // when
      const nextState = getNormalizedMergedState(state, patch)

      // then
      const expectedNextState = {
        books: [
          { id: 0, text: 'my foo' },
          { id: 1, text: 'you foo' },
        ],
      }
      expect(nextState).toStrictEqual(expectedNextState)
      expect(Object.is(nextState, state)).toBe(false)
      expect(Object.is(nextState.foos, state.books)).toBe(false)
      expect(Object.is(nextState.books[0], state.books[0])).toBe(true)
    })

    it('should replace already existing entity in the data array', () => {
      // given
      const state = {
        books: [{ id: 0, text: 'I will be replaced!' }],
      }
      const patch = {
        books: [
          { id: 0, text: 'my refreshed foo' },
          { id: 1, text: 'you foo' },
        ],
      }

      // when
      const nextState = getNormalizedMergedState(state, patch)

      // then
      const expectedNextState = {
        books: [
          { id: 0, text: 'my refreshed foo' },
          { id: 1, text: 'you foo' },
        ],
      }
      expect(nextState).toStrictEqual(expectedNextState)
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
          books: [{ id: 0, text: 'my foo' }],
        }
        const patch = {
          books: [{ id: 1, text: 'you foo' }],
        }
        const config = { isMergingArray: false }

        // when
        const nextState = getNormalizedMergedState(state, patch, config)

        // then
        const expectedNextState = {
          books: [{ id: 1, text: 'you foo' }],
        }
        expect(nextState).toStrictEqual(expectedNextState)
        expect(Object.is(nextState, state)).toBe(false)
        expect(Object.is(nextState.foos, state.books)).toBe(false)
        expect(Object.is(nextState.books[0], state.books[0])).toBe(false)
      })
    })

    describe('isMutatingArray', () => {
      it('should merge the new collection into the previous one without mutating array when isMutatingArray is false and datum inside are not mutated', () => {
        // given
        const state = {
          books: [{ id: 0, text: 'my foo' }],
        }
        const patch = {
          books: [{ id: 1, text: 'you foo' }],
        }
        const config = { isMutatingArray: false }

        // when
        const nextState = getNormalizedMergedState(state, patch, config)

        // then
        const expectedNextState = {
          books: [
            { id: 0, text: 'my foo' },
            { id: 1, text: 'you foo' },
          ],
        }
        expect(nextState).toStrictEqual(expectedNextState)
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
            { id: 0, notReplacedText: 'I will stay alive!', text: 'my foo' },
          ],
        }
        const patch = {
          books: [
            { id: 0, mergedText: 'I am new here', text: 'my refreshed foo' },
            { id: 1, text: 'you foo' },
          ],
        }
        const config = { isMergingDatum: true }

        // when
        const nextState = getNormalizedMergedState(state, patch, config)

        // then
        const expectedNextState = {
          books: [
            {
              id: 0,
              mergedText: 'I am new here',
              notReplacedText: 'I will stay alive!',
              text: 'my refreshed foo',
            },
            { id: 1, text: 'you foo' },
          ],
        }
        expect(nextState).toStrictEqual(expectedNextState)
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
            { id: 0, notReplacedText: 'I will stay alive!', text: 'my foo' },
          ],
        }
        const patch = {
          books: [
            { id: 0, mergedText: 'I am new here', text: 'my refreshed foo' },
            { id: 1, text: 'you foo' },
          ],
        }
        const config = { isMergingDatum: true, isMutatingDatum: true }

        // when
        const nextState = getNormalizedMergedState(state, patch, config)

        // then
        const expectedNextState = {
          books: [
            {
              id: 0,
              mergedText: 'I am new here',
              notReplacedText: 'I will stay alive!',
              text: 'my refreshed foo',
            },
            { id: 1, text: 'you foo' },
          ],
        }
        expect(nextState).toStrictEqual(expectedNextState)
        expect(Object.is(nextState, state)).toBe(false)
        expect(Object.is(nextState.foos, state.books)).toBe(false)
        expect(Object.is(nextState.books[0], state.books[0])).toBe(false)
      })
    })
  })

  describe('using normalizer config', () => {
    it('normalizes one entity at first level', () => {
      // given
      const state = {}
      const patch = {
        books: [
          {
            author: { id: 1, name: 'Edmond Frostan' },
            authorId: 1,
            id: 1,
            title: 'Your empty noise',
          },
        ],
      }
      const config = {
        normalizer: {
          books: {
            normalizer: {
              author: 'authors',
            },
            stateKey: 'books',
          },
        },
      }

      // when
      const nextState = getNormalizedMergedState(state, patch, config)

      // then
      const expectedNextState = {
        authors: [
          {
            id: 1,
            name: 'Edmond Frostan',
            __normalizers__: [{ datumKey: 'author' }],
          },
        ],
        books: [
          {
            author: { stateKey: 'authors', type: '__normalizer__' },
            authorId: 1,
            id: 1,
            title: 'Your empty noise',
          },
        ],
      }
      expect(nextState).toStrictEqual(expectedNextState)
    })

    it('normalizes array of entities at first level', () => {
      // given
      const state = {}
      const patch = {
        books: [
          {
            id: 1,
            paragraphs: [
              { bookId: 1, id: 1, text: 'Your noise is kind of a rock.' },
              { bookId: 1, id: 2, text: 'Your noise is kind of an orange.' },
            ],
            title: 'Your noise',
          },
        ],
      }
      const config = {
        normalizer: {
          books: {
            normalizer: {
              paragraphs: 'paragraphs',
            },
            stateKey: 'books',
          },
        },
      }

      // when
      const nextState = getNormalizedMergedState(state, patch, config)

      // then
      const expectedNextState = {
        books: [
          {
            paragraphs: { stateKey: 'paragraphs', type: '__normalizer__' },
            id: 1,
            title: 'Your noise',
          },
        ],
        paragraphs: [
          {
            bookId: 1,
            id: 1,
            text: 'Your noise is kind of a rock.',
            __normalizers__: [{ datumKey: 'paragraphs' }],
          },
          {
            bookId: 1,
            id: 2,
            text: 'Your noise is kind of an orange.',
            __normalizers__: [{ datumKey: 'paragraphs' }],
          },
        ],
      }
      expect(nextState).toStrictEqual(expectedNextState)
    })

    it('normalizes all kind at the first level', () => {
      // given
      const state = {
        authors: [{ id: 0, name: 'John Marxou' }],
        books: [{ authorId: 0, id: 0, text: 'my foo', title: 'My foo' }],
        paragraphs: [
          { bookId: 0, id: 0, text: 'My foo is lovely.' },
          { bookId: 0, id: 1, text: 'But I prefer fee.' },
        ],
      }
      const patch = {
        books: [
          {
            author: { id: 1, name: 'Edmond Frostan' },
            authorId: 1,
            id: 1,
            paragraphs: [
              { bookId: 1, id: 3, text: 'Your noise is kind of a rock.' },
            ],
            title: 'Your noise',
          },
          {
            author: { id: 1, name: 'Edmond Frostan' },
            authorId: 1,
            id: 2,
            paragraphs: [],
            title: 'Your empty noise',
          },
        ],
      }
      const config = {
        normalizer: {
          books: {
            normalizer: {
              author: 'authors',
              paragraphs: 'paragraphs',
            },
            stateKey: 'books',
          },
        },
      }

      // when
      const nextState = getNormalizedMergedState(state, patch, config)

      // then
      const expectedNextState = {
        authors: [
          { id: 0, name: 'John Marxou' },
          {
            id: 1,
            name: 'Edmond Frostan',
            __normalizers__: [{ datumKey: 'author' }],
          },
        ],
        books: [
          { authorId: 0, id: 0, text: 'my foo', title: 'My foo' },
          {
            author: { stateKey: 'authors', type: '__normalizer__' },
            authorId: 1,
            paragraphs: { stateKey: 'paragraphs', type: '__normalizer__' },
            id: 1,
            title: 'Your noise',
          },
          {
            author: { stateKey: 'authors', type: '__normalizer__' },
            authorId: 1,
            paragraphs: { stateKey: 'paragraphs', type: '__normalizer__' },
            id: 2,
            title: 'Your empty noise',
          },
        ],
        paragraphs: [
          { bookId: 0, id: 0, text: 'My foo is lovely.' },
          { bookId: 0, id: 1, text: 'But I prefer fee.' },
          {
            bookId: 1,
            id: 3,
            text: 'Your noise is kind of a rock.',
            __normalizers__: [{ datumKey: 'paragraphs' }],
          },
        ],
      }
      expect(nextState).toStrictEqual(expectedNextState)
    })

    it('normalizes with cumulated __normalizers__', () => {
      // given
      const state = {}
      const patch = {
        books: [
          {
            author: { id: 1, name: 'Edmond Frostan' },
            authorId: 1,
            id: 1,
            sameAuthor: { id: 1, name: 'Edmond Frostan' },
            sameAuthorId: 1,
            title: 'Your empty noise',
          },
        ],
      }
      const config = {
        normalizer: {
          books: {
            normalizer: {
              author: 'authors',
              sameAuthor: 'authors',
            },
            stateKey: 'books',
          },
        },
      }

      // when
      const nextState = getNormalizedMergedState(state, patch, config)

      // then
      const expectedNextState = {
        authors: [
          {
            id: 1,
            name: 'Edmond Frostan',
            __normalizers__: [
              { datumKey: 'author' },
              { datumKey: 'sameAuthor' },
            ],
          },
        ],
        books: [
          {
            author: { stateKey: 'authors', type: '__normalizer__' },
            authorId: 1,
            id: 1,
            sameAuthor: { stateKey: 'authors', type: '__normalizer__' },
            sameAuthorId: 1,
            title: 'Your empty noise',
          },
        ],
      }
      expect(nextState).toStrictEqual(expectedNextState)
    })

    it('normalizes entities at deep levels', () => {
      // given
      const state = {
        authors: [
          {
            id: 0,
            name: 'John Marxou',
            placeId: 0,
          },
        ],
        books: [
          {
            authorId: 0,
            id: 0,
            text: 'my foo',
            title: 'My foo',
          },
        ],
        paragraphs: [
          {
            bookId: 0,
            id: 0,
            text: 'My foo is lovely.',
          },
          {
            bookId: 0,
            id: 1,
            text: 'But I prefer fee.',
          },
        ],
        places: [{ address: '11, rue de la Potalerie', city: 'Paris', id: 0 }],
        tags: [{ id: 0, label: 'WTF', paragraphId: 0 }],
      }
      const patch = {
        books: [
          {
            author: {
              id: 1,
              name: 'Edmond Frostan',
              place: { address: '10, rue de Venise', city: 'Vannes', id: 1 },
              placeId: 1,
            },
            authorId: 1,
            id: 1,
            paragraphs: [
              {
                bookId: 1,
                id: 3,
                tags: [
                  { id: 1, label: 'un cap', paragraphId: 3 },
                  { id: 2, label: 'une péninsule', paragraphId: 3 },
                ],
                text: 'Your noise is kind of a rock.',
              },
            ],
            title: 'Your noise',
          },
        ],
      }
      const config = {
        normalizer: {
          books: {
            normalizer: {
              author: {
                normalizer: {
                  place: 'places',
                },
                stateKey: 'authors',
              },
              paragraphs: {
                normalizer: {
                  tags: 'tags',
                },
                stateKey: 'paragraphs',
              },
            },
            stateKey: 'books',
          },
        },
      }

      // when
      const nextState = getNormalizedMergedState(state, patch, config)

      // then
      const expectedNextState = {
        authors: [
          { id: 0, name: 'John Marxou', placeId: 0 },
          {
            id: 1,
            name: 'Edmond Frostan',
            place: { stateKey: 'places', type: '__normalizer__' },
            placeId: 1,
            __normalizers__: [{ datumKey: 'author' }],
          },
        ],
        books: [
          { authorId: 0, id: 0, text: 'my foo', title: 'My foo' },
          {
            author: { stateKey: 'authors', type: '__normalizer__' },
            authorId: 1,
            id: 1,
            paragraphs: { stateKey: 'paragraphs', type: '__normalizer__' },
            title: 'Your noise',
          },
        ],
        paragraphs: [
          { bookId: 0, id: 0, text: 'My foo is lovely.' },
          { bookId: 0, id: 1, text: 'But I prefer fee.' },
          {
            bookId: 1,
            id: 3,
            tags: { stateKey: 'tags', type: '__normalizer__' },
            text: 'Your noise is kind of a rock.',
            __normalizers__: [{ datumKey: 'paragraphs' }],
          },
        ],
        places: [
          { address: '11, rue de la Potalerie', city: 'Paris', id: 0 },
          {
            address: '10, rue de Venise',
            city: 'Vannes',
            id: 1,
            __normalizers__: [{ datumKey: 'place' }],
          },
        ],
        tags: [
          { id: 0, label: 'WTF', paragraphId: 0 },
          {
            id: 1,
            label: 'un cap',
            paragraphId: 3,
            __normalizers__: [{ datumKey: 'tags' }],
          },
          {
            id: 2,
            label: 'une péninsule',
            paragraphId: 3,
            __normalizers__: [{ datumKey: 'tags' }],
          },
        ],
      }
      expect(nextState).toStrictEqual(expectedNextState)
    })

    it('normalizes entities at deep levels with deep isMergingDatum', () => {
      // given
      const state = {
        authors: [
          {
            id: 0,
            name: 'John Marxou',
            placeId: 0,
          },
        ],
        books: [
          {
            authorId: 0,
            id: 0,
            text: 'my foo',
            title: 'My foo',
          },
        ],
        paragraphs: [
          {
            bookId: 0,
            id: 0,
            text: 'My foo is lovely.',
          },
          {
            bookId: 0,
            id: 1,
            text: 'But I prefer fee.',
          },
        ],
        places: [{ address: '11, rue de la Potalerie', city: 'Paris', id: 0 }],
        tags: [
          {
            id: 1,
            label: 'WTF',
            paragraphId: 0,
            remainingKey: 'I should stay !',
          },
        ],
      }
      const patch = {
        books: [
          {
            author: {
              id: 1,
              name: 'Edmond Frostan',
              place: { address: '10, rue de Venise', city: 'Vannes', id: 1 },
              placeId: 1,
            },
            authorId: 1,
            id: 1,
            paragraphs: [
              {
                bookId: 1,
                id: 3,
                tags: [
                  { id: 1, label: 'NEW WTF', paragraphId: 3 },
                  { id: 2, label: 'un cap', paragraphId: 3 },
                  { id: 3, label: 'une péninsule', paragraphId: 3 },
                ],
                text: 'Your noise is kind of a rock.',
              },
            ],
            title: 'Your noise',
          },
        ],
      }
      const config = {
        normalizer: {
          books: {
            normalizer: {
              author: {
                normalizer: {
                  place: 'places',
                },
                stateKey: 'authors',
              },
              paragraphs: {
                normalizer: {
                  tags: {
                    isMergingDatum: true,
                    stateKey: 'tags',
                  },
                },
                stateKey: 'paragraphs',
              },
            },
            stateKey: 'books',
          },
        },
      }

      // when
      const nextState = getNormalizedMergedState(state, patch, config)

      // then
      const expectedNextState = {
        authors: [
          { id: 0, name: 'John Marxou', placeId: 0 },
          {
            id: 1,
            name: 'Edmond Frostan',
            place: { stateKey: 'places', type: '__normalizer__' },
            placeId: 1,
            __normalizers__: [{ datumKey: 'author' }],
          },
        ],
        books: [
          { authorId: 0, id: 0, text: 'my foo', title: 'My foo' },
          {
            author: { stateKey: 'authors', type: '__normalizer__' },
            authorId: 1,
            id: 1,
            paragraphs: { stateKey: 'paragraphs', type: '__normalizer__' },
            title: 'Your noise',
          },
        ],
        paragraphs: [
          { bookId: 0, id: 0, text: 'My foo is lovely.' },
          { bookId: 0, id: 1, text: 'But I prefer fee.' },
          {
            bookId: 1,
            id: 3,
            tags: { stateKey: 'tags', type: '__normalizer__' },
            text: 'Your noise is kind of a rock.',
            __normalizers__: [{ datumKey: 'paragraphs' }],
          },
        ],
        places: [
          { address: '11, rue de la Potalerie', city: 'Paris', id: 0 },
          {
            address: '10, rue de Venise',
            city: 'Vannes',
            id: 1,
            __normalizers__: [{ datumKey: 'place' }],
          },
        ],
        tags: [
          {
            id: 1,
            label: 'NEW WTF',
            paragraphId: 3,
            remainingKey: 'I should stay !',
            __normalizers__: [{ datumKey: 'tags' }],
          },
          {
            id: 2,
            label: 'un cap',
            paragraphId: 3,
            __normalizers__: [{ datumKey: 'tags' }],
          },
          {
            id: 3,
            label: 'une péninsule',
            paragraphId: 3,
            __normalizers__: [{ datumKey: 'tags' }],
          },
        ],
      }
      expect(nextState).toStrictEqual(expectedNextState)
    })

    it('should merge with a collection that appears twice in the normalizer config', () => {
      // given
      const state = {
        dossiers: [
          {
            id: 'A',
            sketches: { stateKey: 'sketches', type: '__normalizer__' },
          },
        ],
        measurements: [
          {
            id: 'B',
            isSoftDeleted: false,
            __normalizers__: [{ datumKey: 'measurements' }],
          },
          {
            id: 'C',
            __normalizers__: [{ datumKey: 'measurements' }],
          },
        ],
        sketches: [
          {
            id: 'D',
            measurements: { stateKey: 'measurements', type: '__normalizer__' },
            __normalizers__: [{ datumKey: 'sketches' }],
          },
        ],
      }
      const patch = {
        dossiers: [
          {
            id: 'A',
            measurements: [
              {
                id: 'B',
                isSoftDeleted: true,
              },
            ],
            sketches: [
              {
                id: 'D',
                measurements: [
                  {
                    id: 'C',
                  },
                ],
              },
            ],
          },
        ],
      }
      const config = {
        normalizer: {
          dossiers: {
            normalizer: {
              measurements: 'measurements',
              sketches: {
                normalizer: {
                  measurements: 'measurements',
                },
                stateKey: 'sketches',
              },
            },
            stateKey: 'dossiers',
          },
        },
      }

      // when
      const nextState = getNormalizedMergedState(state, patch, config)

      // then
      const expectedNextState = {
        dossiers: [
          {
            id: 'A',
            measurements: { stateKey: 'measurements', type: '__normalizer__' },
            sketches: { stateKey: 'sketches', type: '__normalizer__' },
          },
        ],
        measurements: [
          {
            id: 'B',
            isSoftDeleted: true,
            __normalizers__: [{ datumKey: 'measurements' }],
          },
          { id: 'C', __normalizers__: [{ datumKey: 'measurements' }] },
        ],
        sketches: [
          {
            id: 'D',
            measurements: { stateKey: 'measurements', type: '__normalizer__' },
            __normalizers__: [{ datumKey: 'sketches' }],
          },
        ],
      }
      expect(nextState).toStrictEqual(expectedNextState)
    })
  })

  describe('when merging with activityIdentifier', () => {
    it('should merge to already existing entity', () => {
      // given
      const state = {
        foos: [
          {
            activityIdentifier: 0,
          },
        ],
      }
      const patch = {
        foos: [
          {
            activityIdentifier: 0,
            id: 0,
          },
        ],
      }

      // when
      const nextState = getNormalizedMergedState(state, patch)

      // then
      // then
      const expectedNextState = {
        foos: [
          {
            activityIdentifier: 0,
            id: 0,
          },
        ],
      }
      expect(nextState).toStrictEqual(expectedNextState)
    })
  })
})
