// src/lib/mongodb.ts
import { MongoClient } from 'mongodb';

// Sprawdzamy, czy zmienna środowiskowa z adresem do bazy jest ustawiona
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// W środowisku deweloperskim (na Twoim komputerze) używamy zmiennej globalnej,
// aby zachować jedno połączenie przy każdym przeładowaniu kodu.
// Zapobiega to tworzeniu setek połączeń podczas developmentu.
if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // W środowisku produkcyjnym (na Vercelu) tworzymy po prostu jedno połączenie.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Eksportujemy obietnicę połączenia, której będziemy używać w naszych plikach API.
export default clientPromise;