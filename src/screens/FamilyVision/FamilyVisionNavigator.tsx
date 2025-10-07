import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FamilyVisionScreen from './FamilyVisionScreen';
import AddFamilyVisionScreen from './AddFamilyVisionScreen';

const Stack = createStackNavigator();

const FamilyVisionNavigator: React.FC = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="FamilyVisionMain" component={FamilyVisionScreen} />
            <Stack.Screen name="AddGoal" component={AddFamilyVisionScreen} />
        </Stack.Navigator>
    );
};

export default FamilyVisionNavigator;
