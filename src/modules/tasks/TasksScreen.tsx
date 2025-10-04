import React from 'react';
import { TaskManagementMock } from '../../screens/TaskManagementMock';

interface TasksScreenProps {
    navigation: any;
}

const TasksScreen: React.FC<TasksScreenProps> = ({ navigation }) => {
    return <TaskManagementMock />;
};

export default TasksScreen;