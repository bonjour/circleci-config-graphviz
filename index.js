import fs from 'fs';
import YAML from 'yaml';
import yargs from 'yargs';

dump();

function dump() {

    const argv = yargs
        .usage('Usage $0 <config.js> [Options]')
        .option('file', {
            description: 'file to parse',
            alias: 'f',
            type: 'string'
        })
        .option('workflow', {
            description: 'name of the workflow to draw',
            alias: 'w',
            type: 'string'
        })
        .demandOption(['file', 'workflow'])
        .argv;

    let nodes = findNodes(argv);
    let edges = findEdges(argv);

    console.log(startDot() + addNodes(nodes) + addEdges(edges) + endDot());
}

function findNodes(argv) {
    let nodes = [];
    
    const file = fs.readFileSync(argv.file, 'utf8');
    const result = YAML.parse(file);
    result.workflows[argv.workflow].jobs.forEach(job => {
        const jobName = Object.entries(job)[0][0];
        nodes.push({"name": toSnakeCase(jobName), "label": jobName})
    });

    return nodes;
}

function findEdges(argv) {

    let edges = [];
    
    const file = fs.readFileSync(argv.file, 'utf8');
    const result = YAML.parse(file);
    result.workflows[argv.workflow].jobs.forEach(job => {
        const jobName = Object.entries(job)[0][0];
        const requires = job[jobName].requires;

        if (requires === undefined) return edges;
        requires.forEach(dependency => {
            edges.push({"from": toSnakeCase(dependency), "to": toSnakeCase(jobName)})
        });
    });

    return edges;
}

function startDot() {
    return 'digraph sc {\n ratio="compress" rankdir="LR";\n node [fontsize="11" fontname="Arial" shape="record"];\n\n';
}

function endDot() {
    return '}\n';
}

function addNodes(nodes) {
    let result = '';
    nodes.forEach(node => {
        result += ' ' + node.name + ' [label="' + node.label + '"];\n';
    });

    return result;
}

function addEdges(edges) {
    let result = '';

    edges.forEach(edge => {
        result += ' ' + edge.from + ' -> ' + edge.to + ';\n';
    })

    return result;
}

function toSnakeCase(str) {
    return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join('_');
} 