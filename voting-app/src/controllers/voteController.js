const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.castVote = async (req, res) => {
  try {
    const { userId, pollOptionId } = req.body;
    if(!userId || !pollOptionId) return res.status(400).json({ error: 'Missing fields' });

    // ensure poll option exists
    const option = await prisma.pollOption.findUnique({ where: { id: Number(pollOptionId) }});
    if(!option) return res.status(404).json({ error: 'Poll option not found' });

    // create vote (unique constraint prevents duplicates)
    try {
      const vote = await prisma.vote.create({
        data: {
          userId: Number(userId),
          pollOptionId: Number(pollOptionId)
        }
      });

      // after vote, emit updated poll counts via Socket.IO if available
      const io = req.app.get('io') || null;
      // if not available via req, attempt global (safe-guard)
      if(io && typeof io.emitUpdatedPoll === 'function') {
        io.emitUpdatedPoll(option.pollId);
      } else {
        // try fallback on global io
        try {
          const globalIo = require('../websocket').io;
          if(globalIo && typeof globalIo.emitUpdatedPoll === 'function') {
            globalIo.emitUpdatedPoll(option.pollId);
          }
        } catch (e) { /* ignore */ }
      }

      res.json({ ok: true, voteId: vote.id });
    } catch (e) {
      // likely unique constraint (user already voted this option)
      console.error(e);
      return res.status(400).json({ error: 'You may have already voted for this option or invalid request' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};