const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Data file path
const DATA_FILE = path.join(__dirname, 'data.json');

// Helper to read data file
async function readDataFile() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or has invalid JSON, return default structure
    return { supplies: [], people: [], messages: [] };
  }
}

// Helper to write data file
async function writeDataFile(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// === API ROUTES ===

// Get all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await readDataFile();
    res.json(data);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Get specific supply
app.get('/api/supplies/:id', async (req, res) => {
  try {
    const data = await readDataFile();
    const supply = data.supplies.find(s => s.id === req.params.id);
    
    if (!supply) {
      return res.status(404).json({ error: 'Supply not found' });
    }
    
    res.json(supply);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read supply' });
  }
});

// Create or update supply
app.post('/api/supplies', async (req, res) => {
  try {
    const data = await readDataFile();
    const newSupply = req.body;
    
    // Check if supply exists (update) or is new (create)
    const index = data.supplies.findIndex(s => s.id === newSupply.id);
    
    if (index !== -1) {
      // Update existing supply
      data.supplies[index] = newSupply;
    } else {
      // Create new supply
      data.supplies.push(newSupply);
    }
    
    await writeDataFile(data);
    res.json(newSupply);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save supply' });
  }
});

// Delete supply
app.delete('/api/supplies/:id', async (req, res) => {
  try {
    const data = await readDataFile();
    data.supplies = data.supplies.filter(s => s.id !== req.params.id);
    await writeDataFile(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete supply' });
  }
});

// Create or update person
app.post('/api/people', async (req, res) => {
  try {
    const data = await readDataFile();
    const newPerson = req.body;
    
    const index = data.people.findIndex(p => p.id === newPerson.id);
    
    if (index !== -1) {
      data.people[index] = newPerson;
    } else {
      data.people.push(newPerson);
    }
    
    await writeDataFile(data);
    res.json(newPerson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save person' });
  }
});

// Get specific person
app.get('/api/people/:id', async (req, res) => {
  try {
    const data = await readDataFile();
    const person = data.people.find(p => p.id === req.params.id);
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.json(person);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read person' });
  }
});

// Delete person
app.delete('/api/people/:id', async (req, res) => {
  try {
    const data = await readDataFile();
    data.people = data.people.filter(p => p.id !== req.params.id);
    await writeDataFile(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete person' });
  }
});

// Create message
app.post('/api/messages', async (req, res) => {
  try {
    const data = await readDataFile();
    const newMessage = req.body;
    
    data.messages.push(newMessage);
    await writeDataFile(data);
    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Get all collaborators
app.get('/api/collaborators', async (req, res) => {
  try {
    const data = await readDataFile();
    res.json(data.collaborators || []);
  } catch (error) {
    console.error('Error reading collaborators:', error);
    res.status(500).json({ error: 'Failed to read collaborators' });
  }
});

// Get specific collaborator
app.get('/api/collaborators/:id', async (req, res) => {
  try {
    const data = await readDataFile();
    const collaborator = data.collaborators?.find(c => c.id === req.params.id);
    
    if (!collaborator) {
      return res.status(404).json({ error: 'Collaborator not found' });
    }
    
    res.json(collaborator);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read collaborator' });
  }
});

// Create or update collaborator
app.post('/api/collaborators', async (req, res) => {
  try {
    const data = await readDataFile();
    
    // Initialize collaborators array if it doesn't exist
    if (!data.collaborators) {
      data.collaborators = [];
    }
    
    const newCollaborator = req.body;
    
    // Check if collaborator exists (update) or is new (create)
    const index = data.collaborators.findIndex(c => c.id === newCollaborator.id);
    
    if (index !== -1) {
      // Update existing collaborator
      data.collaborators[index] = newCollaborator;
    } else {
      // Create new collaborator
      data.collaborators.push(newCollaborator);
    }
    
    await writeDataFile(data);
    res.json(newCollaborator);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save collaborator' });
  }
});

// Delete collaborator
app.delete('/api/collaborators/:id', async (req, res) => {
  try {
    const data = await readDataFile();
    
    if (!data.collaborators) {
      return res.json({ success: true });
    }
    
    data.collaborators = data.collaborators.filter(c => c.id !== req.params.id);
    await writeDataFile(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete collaborator' });
  }
});

// Get all shelters
app.get('/api/shelters', async (req, res) => {
  try {
    const data = await readDataFile();
    res.json(data.shelters || []);
  } catch (error) {
    console.error('Error reading shelters:', error);
    res.status(500).json({ error: 'Failed to read shelters' });
  }
});

// Get specific shelter
app.get('/api/shelters/:id', async (req, res) => {
  try {
    const data = await readDataFile();
    const shelter = data.shelters?.find(s => s.id === req.params.id);
    
    if (!shelter) {
      return res.status(404).json({ error: 'Shelter not found' });
    }
    
    res.json(shelter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read shelter' });
  }
});

// Create or update shelter
app.post('/api/shelters', async (req, res) => {
  try {
    const data = await readDataFile();
    
    // Initialize shelters array if it doesn't exist
    if (!data.shelters) {
      data.shelters = [];
    }
    
    const newShelter = req.body;
    
    // Check if shelter exists (update) or is new (create)
    const index = data.shelters.findIndex(s => s.id === newShelter.id);
    
    if (index !== -1) {
      // Update existing shelter
      data.shelters[index] = newShelter;
    } else {
      // Create new shelter
      data.shelters.push(newShelter);
    }
    
    await writeDataFile(data);
    res.json(newShelter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save shelter' });
  }
});

// Delete shelter
app.delete('/api/shelters/:id', async (req, res) => {
  try {
    const data = await readDataFile();
    
    if (!data.shelters) {
      return res.json({ success: true });
    }
    
    data.shelters = data.shelters.filter(s => s.id !== req.params.id);
    await writeDataFile(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete shelter' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});