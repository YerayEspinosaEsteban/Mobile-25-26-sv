import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { COLORS } from "../constants/mock";

interface Props {
    card: {
        title: string;
        location: string;
        price: string;
        rating: number;
        image: string;
    };
}

export default function ListingCard({ card }: Props) {
    return (
        <View style={styles.card}>
            <Image source={{ uri: card.image }}
                style={styles.image}></Image>
            <View style={styles.info}>
                <Text style={styles.title}>{card.location}</Text>
                <Text style={styles.rating}>{card.rating}</Text>
            </View>
            <Text>{card.title}</Text>
            <Text>{card.location}</Text>
            <Text>{card.price}</Text>
            <Text>{card.rating}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 24,
        backgroundColor: COLORS.white,
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        marginBottom: 10,
        backgroundColor: COLORS.lightGrey,
    },
    info: {
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    rating: {
        fontSize: 15,
        color: COLORS.dark,
        fontWeight: '400',
    }
});