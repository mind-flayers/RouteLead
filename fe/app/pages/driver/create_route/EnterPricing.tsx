import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../../../components/ui/PrimaryButton';
import SecondaryButton from '../../../../components/ui/SecondaryButton';
import PrimaryCard from '../../../../components/ui/PrimaryCard';

const EnterPricing = () => {
  const router = useRouter();
  const initialPrice = 150; // Example initial price
  const [suggestedPrice, setSuggestedPrice] = useState(String(initialPrice));
  const [selectedProfitMargin, setSelectedProfitMargin] = useState(""); // Default selected

  const calculatePrice = (basePrice: number, margin: string) => {
    const percentage = parseFloat(margin) / 100;
    return (basePrice * (1 + percentage)).toFixed(2);
  };

  const handleProfitMarginSelect = (margin: string) => {
    setSelectedProfitMargin(margin);
    const newPrice = calculatePrice(initialPrice, margin);
    setSuggestedPrice(newPrice);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Create Route',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, styles.activeStep]}>
            <Text style={styles.progressText}>1</Text>
          </View>
          <Text style={[styles.progressLabel, styles.boldLabel]}>Route Details</Text>
        </View>
        <View style={styles.progressBar} />
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, styles.activeStep]}>
            <Text style={styles.progressText}>2</Text>
          </View>
          <Text style={[styles.progressLabel, styles.boldLabel]}>Bidding & Capacity</Text>
        </View>
        <View style={styles.progressBar} />
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, styles.activeStep]}>
            <Text style={styles.progressText}>3</Text>
          </View>
          <Text style={[styles.progressLabel, styles.boldLabel]}>Pricing & Suggestions</Text>
        </View>
        <View style={styles.progressBar} />
        <View style={styles.progressStep}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>4</Text>
          </View>
          <Text style={styles.progressLabel}>Overview</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Content for Pricing */}
        <PrimaryCard title="AI Suggested Price" style={styles.priceCard}>
          <View style={styles.priceInputContainer}>
            <Text style={styles.currencyLabel}>LKR</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="150"
              keyboardType="numeric"
              value={suggestedPrice}
              onChangeText={setSuggestedPrice}
            />
          </View>
          <Text style={styles.profitMarginLabel}>Profit Margin</Text>
          <View style={styles.profitMarginButtons}>
            {['5%', '10%', '15%', '20%'].map((margin) => (
              <TouchableOpacity
                key={margin}
                style={[
                  styles.marginButton,
                  selectedProfitMargin === margin && styles.activeMarginButton,
                ]}
                onPress={() => handleProfitMarginSelect(margin)}
              >
                <Text
                  style={[
                    styles.marginButtonText,
                    selectedProfitMargin === margin && styles.activeMarginButtonText,
                  ]}
                >
                  {margin}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.infoBox}>
            <Ionicons name="document-text-outline" size={18} color="#666" />
            <Text style={styles.infoText}>
              AI suggested price based on route distance, capacity, and current fuel market price.
            </Text>
          </View>
        </PrimaryCard>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <SecondaryButton onPress={() => router.push('/pages/driver/create_route/EnterBiddingDetails')} title="Back" style={styles.button} />
        <PrimaryButton onPress={() => router.push('/pages/driver/create_route/PostRoute')} title="Next" style={styles.button} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollViewContent: {
    paddingBottom: 20, // Add padding to the bottom of the scrollable content
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  activeStep: {
    backgroundColor: '#FF8C00', // Orange color for active step
  },
  progressText: {
    color: 'white',
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#555',
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: -15, // Overlap with circles
  },
  priceCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
  },
  currencyLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  priceInput: {
    flex: 1,
    fontSize: 18,
    color: '#333',
  },
  profitMarginLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  profitMarginButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  marginButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeMarginButton: {
    backgroundColor: '#FF8C00',
  },
  marginButtonText: {
    color: '#555',
    fontWeight: 'bold',
  },
  activeMarginButtonText: {
    color: 'white',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e6f7ff', // Light blue background
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#91d5ff',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#f8f8f8', // Match container background
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  boldLabel: {
    fontWeight: 'bold',
  },
});

export default EnterPricing;
