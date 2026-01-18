#!/usr/bin/env node

/**
 * Claude PM Dashboard - 파일 감시 서버
 * 
 * PROGRESS.md 파일 변경을 감지하고 브라우저에 실시간 전송
 * 
 * 사용법:
 *   node watch-server.js [프로젝트경로]
 * 
 * 예시:
 *   node watch-server.js /path/to/my-project
 *   node watch-server.js .
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const projectPath = process.argv[2] || '.';
const progressPath = path.join(projectPath, 'docs', 'PROGRESS.md');
const srcPath = path.join(projectPath, 'src');

// SSE 클라이언트 목록
let clients = [];

// HTTP 서버 생성
const server = http.createServer((req, res) => {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.url === '/') {
    // 대시보드 HTML 제공
    const htmlPath = path.join(__dirname, 'index.html');
    fs.readFile(htmlPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading dashboard');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
  else if (req.url === '/progress') {
    // PROGRESS.md 내용 제공
    fs.readFile(progressPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'PROGRESS.md not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ content: data }));
    });
  }
  else if (req.url === '/files') {
    // 최근 변경된 파일 목록
    getRecentFiles(srcPath, (err, files) => {
      if (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ files: [] }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ files }));
    });
  }
  else if (req.url === '/events') {
    // SSE 연결
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    
    const clientId = Date.now();
    clients.push({ id: clientId, res });
    
    req.on('close', () => {
      clients = clients.filter(c => c.id !== clientId);
    });
  }
  else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// 파일 변경 감지
function watchFiles() {
  // PROGRESS.md 감시
  if (fs.existsSync(progressPath)) {
    fs.watch(progressPath, (eventType) => {
      if (eventType === 'change') {
        console.log('📝 PROGRESS.md 변경 감지');
        fs.readFile(progressPath, 'utf8', (err, data) => {
          if (!err) {
            sendToClients({ type: 'progress', content: data });
          }
        });
      }
    });
    console.log(`👀 PROGRESS.md 감시 중: ${progressPath}`);
  } else {
    console.log(`⚠️  PROGRESS.md 없음: ${progressPath}`);
  }

  // src 폴더 감시
  if (fs.existsSync(srcPath)) {
    watchDir(srcPath);
    console.log(`👀 src 폴더 감시 중: ${srcPath}`);
  }
}

// 디렉토리 재귀 감시
function watchDir(dir) {
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (filename && !filename.includes('node_modules')) {
      console.log(`📁 파일 변경: ${filename}`);
      sendToClients({ 
        type: 'file', 
        filename: filename,
        event: eventType,
        time: new Date().toLocaleTimeString('ko-KR')
      });
    }
  });
}

// SSE로 클라이언트에 전송
function sendToClients(data) {
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

// 최근 변경된 파일 목록
function getRecentFiles(dir, callback) {
  if (!fs.existsSync(dir)) {
    callback(null, []);
    return;
  }

  const files = [];
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  function scan(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        if (item === 'node_modules' || item.startsWith('.')) continue;
        
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (now - stat.mtimeMs < oneHour) {
          files.push({
            path: path.relative(dir, fullPath),
            modified: stat.mtime,
            status: now - stat.birthtimeMs < oneHour ? 'created' : 'modified'
          });
        }
      }
    } catch (e) {
      // ignore
    }
  }

  scan(dir);
  files.sort((a, b) => new Date(b.modified) - new Date(a.modified));
  callback(null, files.slice(0, 10));
}

// 서버 시작
server.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🚀 Claude PM Dashboard Server            ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║   URL: http://localhost:${PORT}              ║`);
  console.log(`║   프로젝트: ${projectPath.padEnd(27)}║`);
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  
  watchFiles();
});
