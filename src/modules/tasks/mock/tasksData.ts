import { Task, FamilyMember } from '../types/taskTypes';

export const mockFamilyMembers: FamilyMember[] = [];

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Fix kitchen sink",
    description: "The kitchen sink is leaking. Need to check the pipes and fix the issue before dinner.",
    priority: "high",
    assignedTo: "dad",
    dueDate: "2025-10-01T18:00:00",
    status: "overdue",
    steps: [
      "Turn off water supply",
      "Check pipes under sink",
      "Replace washer or gasket",
      "Test for leaks"
    ],
    attachments: [],
    progress: 0,
    points: 20,
    notes: [
      {
        author: "Mom",
        text: "Please check under the sink too. There might be more leaks.",
        createdAt: "2025-10-01T12:00:00",
      },
    ],
    createdAt: "2025-10-01T08:00:00",
    updatedAt: "2025-10-01T12:00:00",
  },
  {
    id: "t2",
    title: "Math Homework",
    description: "Complete pages 42–45 in your math workbook. Show all your work for word problems.",
    priority: "high",
    assignedTo: "jake",
    dueDate: "2025-10-02T18:00:00",
    status: "pending",
    steps: [
      "Complete pages 42-45 in math workbook",
      "Show all work for word problems",
      "Check answers using answer key"
    ],
    attachments: [
      {
        type: "video",
        title: "Math Tutorial Video",
        url: "https://example.com/math-tutorial.mp4",
        duration: "3:42",
      },
      {
        type: "doc",
        title: "Example Problems",
        url: "https://example.com/examples.pdf",
      },
    ],
    progress: 30,
    points: 15,
    notes: [
      {
        author: "Mom",
        text: "Jake, remember to take your time with the word problems. If you need help, just ask! 💪",
        createdAt: "2025-10-02T10:00:00",
      },
    ],
    createdAt: "2025-10-02T08:00:00",
    updatedAt: "2025-10-02T10:00:00",
  },
  {
    id: "t3",
    title: "Assemble new bookshelf",
    description: "Put together the new bookshelf in the living room. Follow the instructions carefully.",
    priority: "medium",
    assignedTo: "dad",
    dueDate: "2025-10-03T14:00:00",
    status: "pending",
    steps: [
      "Unpack all pieces",
      "Follow assembly instructions",
      "Attach shelves to frame",
      "Secure to wall"
    ],
    attachments: [
      {
        type: "video",
        title: "Assembly Instructions",
        url: "https://example.com/assembly-video.mp4",
        duration: "8:15",
      },
    ],
    progress: 0,
    points: 25,
    notes: [],
    createdAt: "2025-10-02T09:00:00",
    updatedAt: "2025-10-02T09:00:00",
  },
  {
    id: "t4",
    title: "Wash the car",
    description: "Clean the family car inside and out. Weather looks good for this weekend.",
    priority: "low",
    assignedTo: "dad",
    dueDate: "2025-10-05T16:00:00",
    status: "pending",
    steps: [
      "Rinse exterior with water",
      "Apply soap and scrub",
      "Rinse and dry",
      "Clean interior"
    ],
    attachments: [],
    progress: 0,
    points: 10,
    notes: [
      {
        author: "Mom",
        text: "Don't forget to vacuum the seats!",
        createdAt: "2025-10-02T11:00:00",
      },
    ],
    createdAt: "2025-10-02T10:00:00",
    updatedAt: "2025-10-02T11:00:00",
  },
  {
    id: "t5",
    title: "Clean bedroom",
    description: "Tidy up your room, organize toys, and make the bed.",
    priority: "medium",
    assignedTo: "emma",
    dueDate: "2025-10-01T20:00:00",
    status: "completed",
    steps: [
      "Put toys in bins",
      "Make the bed",
      "Organize desk",
      "Vacuum floor"
    ],
    attachments: [],
    progress: 100,
    points: 12,
    notes: [
      {
        author: "Mom",
        text: "Great job Emma! Your room looks amazing! ⭐",
        createdAt: "2025-10-01T20:30:00",
      },
    ],
    createdAt: "2025-10-01T16:00:00",
    updatedAt: "2025-10-01T20:30:00",
  },
  {
    id: "t6",
    title: "Science project",
    description: "Complete the volcano experiment for science class. Document the process.",
    priority: "high",
    assignedTo: "emma",
    dueDate: "2025-10-04T15:00:00",
    status: "pending",
    steps: [
      "Gather materials",
      "Build volcano structure",
      "Mix baking soda and vinegar",
      "Record observations"
    ],
    attachments: [
      {
        type: "image",
        title: "Materials List",
        url: "https://example.com/materials.jpg",
      },
    ],
    progress: 15,
    points: 30,
    notes: [
      {
        author: "Dad",
        text: "Make sure to do this outside! It can get messy.",
        createdAt: "2025-10-02T14:00:00",
      },
    ],
    createdAt: "2025-10-02T13:00:00",
    updatedAt: "2025-10-02T14:00:00",
  },
  {
    id: "t7",
    title: "Feed the pets",
    description: "Give food and water to the family pets.",
    priority: "medium",
    assignedTo: "jake",
    dueDate: "2025-10-02T19:00:00",
    status: "completed",
    steps: [
      "Fill dog bowl with food",
      "Fill cat bowl with food",
      "Refresh water bowls",
      "Check litter box"
    ],
    attachments: [],
    progress: 100,
    points: 8,
    notes: [
      {
        author: "Mom",
        text: "Thanks Jake! The pets are happy now.",
        createdAt: "2025-10-02T19:15:00",
      },
    ],
    createdAt: "2025-10-02T18:00:00",
    updatedAt: "2025-10-02T19:15:00",
  },
  {
    id: "t8",
    title: "Grocery shopping",
    description: "Buy ingredients for this week's meals. Check the shopping list.",
    priority: "high",
    assignedTo: "mom",
    dueDate: "2025-10-02T17:00:00",
    status: "pending",
    steps: [
      "Check shopping list",
      "Go to supermarket",
      "Buy fresh produce",
      "Buy pantry items"
    ],
    attachments: [
      {
        type: "doc",
        title: "Shopping List",
        url: "https://example.com/shopping-list.pdf",
      },
    ],
    progress: 0,
    points: 15,
    notes: [],
    createdAt: "2025-10-02T15:00:00",
    updatedAt: "2025-10-02T15:00:00",
  },
];
