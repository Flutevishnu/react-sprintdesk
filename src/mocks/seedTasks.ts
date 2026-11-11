import { type TaskDto } from "../features/tasks/api/schema";
const taskTemplates = [
{ name: 'Set up project', description: 'Initialize project configuration and dependencies' },
{ name: 'Design login page', description: 'Create login page UI and responsive styles' },
{ name: 'Write API docs', description: 'Document API endpoints and request responses' },
{ name: 'Fix navbar bug', description: 'Resolve navigation menu and responsive issues' },
{ name: 'Plan sprint demo', description: 'Prepare sprint demonstration and presentation' },
{ name: 'Implement authentication', description: 'Add user authentication and authorization' },
{ name: 'Create dashboard', description: 'Build dashboard layout and widgets' },
{ name: 'Optimize database', description: 'Improve database queries and performance' },
{ name: 'Write unit tests', description: 'Add unit tests for application components' },
{ name: 'Fix validation errors', description: 'Handle form validation and error messages' },
{ name: 'Implement search', description: 'Add search functionality and filtering' },
{ name: 'Create user profile', description: 'Build user profile management features' },
{ name: 'Integrate payment API', description: 'Connect payment gateway and handle transactions' },
{ name: 'Update documentation', description: 'Update technical and project documentation' },
{ name: 'Fix responsive layout', description: 'Resolve mobile and tablet layout issues' },
{ name: 'Add notifications', description: 'Implement application notification functionality' },
{ name: 'Review pull requests', description: 'Review code changes and provide feedback' },
{ name: 'Deploy application', description: 'Configure and deploy application to production' },
{ name: 'Improve performance', description: 'Identify and optimize application bottlenecks' },
{ name: 'Configure CI/CD', description: 'Set up automated build and deployment pipelines' },
];

const modules = [
'Authentication', 'Dashboard', 'User Management', 'Admin Panel',
'Notifications', 'Payments', 'Reports', 'Analytics',
'Settings', 'Profile Management', 'API Gateway', 'Database',
'Search', 'File Upload', 'Messaging', 'Task Management',
'Project Management', 'Billing', 'Security', 'Integrations',
'Frontend', 'Backend', 'Testing', 'Deployment', 'Monitoring',
];

const statuses = ['todo', 'in_progress', 'done'] as const;
const priorities = ['low', 'medium', 'high'] as const;

const assignees = [
'Asha', 'Ravi', 'Priya', 'Arun', 'Karthik',
'Divya', 'Rahul', 'Sneha', 'Vikram', 'Meena',
];

export const seedTasks: TaskDto[] = Array.from(
{ length: 500 },
(_, index) => {
    const template = taskTemplates[index % taskTemplates.length];
    const module = modules[Math.floor(index / taskTemplates.length)];

    return {
    id: index + 1,
    name: `${template.name} - ${module}`,
    description: `${template.description} for the ${module} module.`,
    status: statuses[index % statuses.length],
    priority: priorities[index % priorities.length],
    createdAt: new Date(
        Date.UTC(2026, 9, 1 + index)
    ).toISOString(),
    ...(index % 3 !== 0 && {
        assignee: assignees[index % assignees.length],
    }),
    };
}
);