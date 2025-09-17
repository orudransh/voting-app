module.exports = function(io, prisma) {
  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('joinPoll', (data) => {
      const { pollId } = data;
      socket.join(`poll_${pollId}`);
    });

    socket.on('leavePoll', (data) => {
      const { pollId } = data;
      socket.leave(`poll_${pollId}`);
    });

    socket.on('disconnect', () => {
      // console.log('socket disconnected', socket.id);
    });
  });

  // helper to emit updated counts
  const emitUpdatedPoll = async (pollId) => {
    const options = await prisma.pollOption.findMany({
      where: { pollId: Number(pollId) },
      include: { votes: true }
    });

    const payload = options.map(opt => ({
      id: opt.id,
      text: opt.text,
      votes: opt.votes.length
    }));

    io.to(`poll_${pollId}`).emit('pollUpdated', { pollId, options: payload });
  };

  // expose helper
  io.emitUpdatedPoll = emitUpdatedPoll;
};