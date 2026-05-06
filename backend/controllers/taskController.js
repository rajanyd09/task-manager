const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks for a specific project or all assigned tasks for the user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    let tasks;

    if (projectId) {
      // Get tasks for a specific project
      // First verify user has access to project
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      
      if (req.user.role !== 'Admin' && !project.members.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to view tasks for this project' });
      }

      tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name email').populate('project', 'name');
    } else {
      if (req.user.role === 'Admin') {
        // Admin sees ALL tasks across all projects
        tasks = await Task.find({}).populate('assignedTo', 'name email').populate('project', 'name');
      } else {
        // Member sees only tasks assigned to them
        tasks = await Task.find({ assignedTo: req.user._id }).populate('project', 'name');
      }
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name').populate('project', 'name');

    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, project, assignedTo } = req.body;

    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) return res.status(404).json({ message: 'Project not found' });

    // Admin cannot assign a task to themselves
    if (assignedTo && assignedTo.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot assign tasks to themselves' });
    }

    const task = new Task({
      title,
      description,
      status: status || 'Todo',
      dueDate,
      project,
      assignedTo,
    });

    const createdTask = await task.save();
    
    // Populate before sending back to show names in UI immediately
    const populatedTask = await Task.findById(createdTask._id).populate('assignedTo', 'name email');
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, assignedTo } = req.body;

    const task = await Task.findById(req.params.id);

    if (task) {
      // Both Admin and Assigned User can update status. 
      // Only Admin can update other fields easily, but for simplicity we let assigned user update status
      if (req.user.role === 'Admin' || task.assignedTo.equals(req.user._id)) {
        task.title = title || task.title;
        task.description = description !== undefined ? description : task.description;
        task.status = status || task.status;
        task.dueDate = dueDate || task.dueDate;
        
        // Only admin can reassign
        if (req.user.role === 'Admin' && assignedTo !== undefined) {
          task.assignedTo = assignedTo;
        }

        const updatedTask = await task.save();
        const populatedTask = await Task.findById(updatedTask._id).populate('assignedTo', 'name email').populate('project', 'name');
        res.json(populatedTask);
      } else {
        res.status(403).json({ message: 'Not authorized to update this task' });
      }
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      if (req.user.role === 'Admin') {
        await task.deleteOne();
        res.json({ message: 'Task removed' });
      } else {
        res.status(403).json({ message: 'Not authorized to delete tasks' });
      }
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
