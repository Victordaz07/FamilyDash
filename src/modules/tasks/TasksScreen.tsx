import React from 'react';
import TaskManagement from './screens/TaskManagement';

interface TasksScreenProps {
    navigation: any;
}

const TasksScreen: React.FC<TasksScreenProps> = ({ navigation }) => {
    return <TaskManagement navigation={navigation} />;
};

export default TasksScreen;



