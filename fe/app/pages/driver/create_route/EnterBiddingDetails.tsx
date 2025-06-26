import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import PrimaryButton from '../../../../components/ui/PrimaryButton';
import SecondaryButton from '../../../../components/ui/SecondaryButton';
import PrimaryCard from '../../../../components/ui/PrimaryCard';

const EnterBiddingDetails = () => {
  const router = useRouter();

  const [startDate, setStartDate] = useState(new Date(2025, 5, 16)); // June 16th, 2025
  const [startTime, setStartTime] = useState(new Date(2025, 5, 16, 9, 0)); // 09:00 AM
  const [endDate, setEndDate] = useState(new Date(2025, 5, 17)); // June 17th, 2025
  const [endTime, setEndTime] = useState(new Date(2025, 5, 17, 22, 0)); // 10:00 PM

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [selectedWeightUnit, setSelectedWeightUnit] = useState('kg');
  const [showWeightUnitOptions, setShowWeightUnitOptions] = useState(false);

  const [selectedVolumeUnit, setSelectedVolumeUnit] = useState('cm³');
  const [showVolumeUnitOptions, setShowVolumeUnitOptions] = useState(false);

  const [selectedRadiusUnit, setSelectedRadiusUnit] = useState('km');
  const [showRadiusUnitOptions, setShowRadiusUnitOptions] = useState(false);

  const onChangeStartDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate);
  };

  const onChangeStartTime = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || startTime;
    setShowStartTimePicker(Platform.OS === 'ios');
    setStartTime(currentTime);
  };

  const onChangeEndDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };

  const onChangeEndTime = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || endTime;
    setShowEndTimePicker(Platform.OS === 'ios');
    setEndTime(currentTime);
  };

  const showDatePicker = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const toggleDropdown = (setter: React.Dispatch<React.SetStateAction<boolean>>, currentValue: boolean) => {
    setter(!currentValue);
  };

  const selectDropdownItem = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, visibilitySetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(value);
    visibilitySetter(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Create Route',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
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
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>3</Text>
          </View>
          <Text style={styles.progressLabel}>Pricing & Suggestions</Text>
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
        {/* Content for Bidding Details */}
        <Text style={styles.sectionTitle}>Bidding Period</Text>
        <PrimaryCard>
          <Text style={styles.cardLabel}>Start Date & Time</Text>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.datePicker} onPress={() => showDatePicker(setShowStartDatePicker)}>
              <Ionicons name="calendar-outline" size={20} color="#555" />
              <Text style={styles.datePickerText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
          </View>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={onChangeStartDate}
            />
          )}
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.datePicker} onPress={() => showDatePicker(setShowStartTimePicker)}>
              <Ionicons name="time-outline" size={20} color="#555" />
              <Text style={styles.datePickerText}>{formatTime(startTime)}</Text>
            </TouchableOpacity>
          </View>
          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display="default"
              onChange={onChangeStartTime}
            />
          )}
        </PrimaryCard>

        <PrimaryCard>
          <Text style={styles.cardLabel}>End Date & Time</Text>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.datePicker} onPress={() => showDatePicker(setShowEndDatePicker)}>
              <Ionicons name="calendar-outline" size={20} color="#555" />
              <Text style={styles.datePickerText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={onChangeEndDate}
            />
          )}
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.datePicker} onPress={() => showDatePicker(setShowEndTimePicker)}>
              <Ionicons name="time-outline" size={20} color="#555" />
              <Text style={styles.datePickerText}>{formatTime(endTime)}</Text>
            </TouchableOpacity>
          </View>
          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display="default"
              onChange={onChangeEndTime}
            />
          )}
        </PrimaryCard>

        <Text style={styles.sectionTitle}>Remaining Space in the Vehicle</Text>
        <PrimaryCard>
          <Text style={styles.cardLabel}>Total Parcel Volume</Text>
          <View style={styles.inputRow}>
            <Ionicons name="cube-outline" size={20} color="#555" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, styles.smallTextInput]}
              placeholder="25"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.textInput, styles.smallTextInput]}
              placeholder="25"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.textInput, styles.smallTextInput]}
              placeholder="15"
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.dropdown} onPress={() => toggleDropdown(setShowVolumeUnitOptions, showVolumeUnitOptions)}>
              <Text>{selectedVolumeUnit}</Text>
              <Ionicons name="chevron-down" size={16} color="#555" />
            </TouchableOpacity>
          </View>
          {showVolumeUnitOptions && (
            <View style={styles.dropdownOptionsContainer}>
              <TouchableOpacity style={styles.dropdownOption} onPress={() => selectDropdownItem(setSelectedVolumeUnit, 'cm³', setShowVolumeUnitOptions)}>
                <Text style={styles.dropdownOptionText}>cm³</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownOption} onPress={() => selectDropdownItem(setSelectedVolumeUnit, 'm³', setShowVolumeUnitOptions)}>
                <Text style={styles.dropdownOptionText}>m³</Text>
              </TouchableOpacity>
            </View>
          )}
        </PrimaryCard>

        <Text style={styles.sectionTitle}>Pickup Radius</Text>
        <PrimaryCard>
          <Text style={styles.cardLabel}>Maximum Pickup Radius from main route</Text>
          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={20} color="#555" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="5"
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.dropdown} onPress={() => toggleDropdown(setShowRadiusUnitOptions, showRadiusUnitOptions)}>
              <Text>{selectedRadiusUnit}</Text>
              <Ionicons name="chevron-down" size={16} color="#555" />
            </TouchableOpacity>
          </View>
          {showRadiusUnitOptions && (
            <View style={styles.dropdownOptionsContainer}>
              <TouchableOpacity style={styles.dropdownOption} onPress={() => selectDropdownItem(setSelectedRadiusUnit, 'km', setShowRadiusUnitOptions)}>
                <Text style={styles.dropdownOptionText}>km</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownOption} onPress={() => selectDropdownItem(setSelectedRadiusUnit, 'm', setShowRadiusUnitOptions)}>
                <Text style={styles.dropdownOptionText}>m</Text>
              </TouchableOpacity>
            </View>
          )}
        </PrimaryCard>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <SecondaryButton onPress={() => router.push('/pages/driver/create_route/CreateRoute')} title="Back" style={styles.button} />
        <PrimaryButton onPress={() => router.push('/pages/driver/create_route/EnterPricing')} title="Next" style={styles.button} />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
    color: '#333',
  },
  cardLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Light grey background
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    height: 50, // Fixed height for consistency
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0, // Remove default vertical padding
  },
  smallTextInput: {
    flex: 0,
    width: 50, // Adjusted width for better fit
    textAlign: 'center',
    marginHorizontal: 5, // Adjusted margin
    backgroundColor: 'white', // White background for individual small inputs
    borderRadius: 8,
    height: 40, // Fixed height for small inputs
    paddingHorizontal: 5,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#e0e0e0', // Background for dropdown button
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  datePickerText: {
    marginLeft: 10,
    fontSize: 16,
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
  dropdownOptionsContainer: {
    position: 'absolute',
    top: '100%', // Position below the dropdown button
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: 1, // Ensure it appears above other content
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default EnterBiddingDetails;
