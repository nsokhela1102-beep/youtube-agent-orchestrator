import open from 'open';

type Task = {
  taskId: string;
  type: string;
  query?: string;
  url?: string;
};

export async function taskRunner(tasks: Task[]) {
  const results = [];

  for (const task of tasks) {
    try {
      if (task.type === 'navigate') {
        let finalUrl = task.url || '';

        // If we only got a search query, build the RIGHT url
        if (!finalUrl && task.query) {
          const q = task.query.toLowerCase();
          const encoded = encodeURIComponent(task.query);

          const wantsPicture = q.includes('picture') || q.includes('image') || q.includes('photo') || q.includes('pic');

          // OFFICIAL WEBSITE mapping
          if (q.includes('vw') || q.includes('volkswagen')) {
            if (wantsPicture) {
              // This will show pictures DIRECTLY - not web list
              finalUrl = `https://www.google.com/search?q=${encoded}&udm=2`;
            } else {
              finalUrl = `https://www.vw.co.za/en/models/polo.html`;
            }
          } else if (wantsPicture) {
            // Generic FIX: Picture -> Google Images (udm=2 is new Images param)
            finalUrl = `https://www.google.com/search?q=${encoded}&udm=2`;
          } else {
            finalUrl = `https://www.google.com/search?q=${encoded}`;
          }
        }

        console.log(`[TaskRunner] Opening: ${finalUrl}`);
        await open(finalUrl);

        results.push({
          taskId: task.taskId,
          status: 'success',
          output: `Opened ${finalUrl}`
        });
      }
    } catch (err: any) {
      results.push({ taskId: task.taskId, status: 'error', output: err.message });
    }
  }
  return results;
}
export const runTasks = taskRunner;
export default taskRunner;