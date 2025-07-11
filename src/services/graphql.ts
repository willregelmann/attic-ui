import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { config } from '../config';

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: `${config.api.baseUrl.replace('/api', '')}/graphql`,
});

// Auth link to add token to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Apollo Client instance
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
  },
});

// GraphQL Queries
export const HEALTH_CHECK = gql`
  query HealthCheck {
    health
  }
`;

export const GET_COLLECTIONS = gql`
  query GetCollections {
    collections {
      id
      name
      category
      description
      image_url
      completion
      totalItems
      ownedItems
      recentActivity
      year
    }
  }
`;

export const GET_MY_ITEMS = gql`
  query GetMyItems {
    myItems {
      id
      name
      collectible_id
      personal_notes
      user_images
      is_favorite
      acquiredDate
      collectionName
      collectionId
      category
      tags
      collectible {
        id
        name
        imageUrl
      }
    }
  }
`;

// GraphQL Mutations
export const CREATE_COLLECTION = gql`
  mutation CreateCollection($input: CreateCollectionInput!) {
    createCollection(input: $input) {
      id
      name
      category
      description
      image_url
      completion
      totalItems
      ownedItems
      recentActivity
      year
    }
  }
`;

export const UPDATE_COLLECTION = gql`
  mutation UpdateCollection($id: ID!, $input: UpdateCollectionInput!) {
    updateCollection(id: $id, input: $input) {
      id
      name
      category
      description
      image_url
      completion
      totalItems
      ownedItems
      recentActivity
      year
    }
  }
`;

export const CREATE_ITEM = gql`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      id
      name
      collectible_id
      personal_notes
      user_images
      is_favorite
      acquiredDate
      collectionName
      collectionId
      category
      tags
    }
  }
`;

export const UPDATE_ITEM = gql`
  mutation UpdateItem($id: ID!, $input: UpdateItemInput!) {
    updateItem(id: $id, input: $input) {
      id
      name
      collectible_id
      personal_notes
      user_images
      is_favorite
    }
  }
`;

export const DELETE_ITEM = gql`
  mutation DeleteItem($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`;

export const TOGGLE_ITEM_FAVORITE = gql`
  mutation ToggleItemFavorite($id: ID!) {
    toggleItemFavorite(id: $id) {
      id
      is_favorite
    }
  }
`;