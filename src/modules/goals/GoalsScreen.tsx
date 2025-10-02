import React from 'react';
import GoalsMain from './screens/GoalsMain';

interface GoalsScreenProps {
    navigation: any;
}

const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation }) => {
    return <GoalsMain navigation={navigation} />;
};

export default GoalsScreen;