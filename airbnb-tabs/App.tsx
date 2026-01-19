import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LISTINGS } from './constants/mock';
import ListingCard from './components/ListingCard';

export default function App() {
  return (
    <ScrollView>
      {LISTINGS.map((card) => (
        <ListingCard key={card.id} card={card} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});