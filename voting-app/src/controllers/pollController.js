const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createPoll = async (req, res) => {
  try {
    const { question, creatorId, options, isPublished } = req.body;
    if(!question || !creatorId || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ error: 'Missing fields or options' });
    }

    const poll = await prisma.poll.create({
      data: {
        question,
        creatorId: Number(creatorId),
        isPublished: !!isPublished,
        options: {
          create: options.map(text => ({ text }))
        }
      },
      include: { options: true }
    });

    res.json(poll);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPoll = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        options: {
          include: { votes: true }
        },
        creator: { select: { id: true, name: true, email: true } }
      }
    });
    if(!poll) return res.status(404).json({ error: 'Poll not found' });

    const formatted = {
      id: poll.id,
      question: poll.question,
      isPublished: poll.isPublished,
      creator: poll.creator,
      options: poll.options.map(o => ({ id: o.id, text: o.text, votes: o.votes.length }))
    };

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};