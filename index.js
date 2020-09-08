import fs from 'fs';
import YAML from 'yaml';

dump();


function dump() {

    let nodes = findNodes();
    let edges = findEdges();

    console.log(startDot() + addNodes(nodes) + addEdges(edges) + endDot());
}

function findNodes() {
    let nodes = [];
    
    const file = fs.readFileSync('./circleci-config.yml', 'utf8');
    const result = YAML.parse(file);
    result.workflows["cd-staging"].jobs.forEach(job => {
        const jobName = Object.entries(job)[0][0];
        nodes.push({"name": toSnakeCase(jobName), "label": jobName})
    });

    Object.entries(result.jobs).forEach(job => {
        const jobName = job[0];
        nodes.push({"name": toSnakeCase(jobName), "label": jobName})
    });

    return nodes;
}

function findEdges() {

    let edges = [];
    
    const file = fs.readFileSync('./circleci-config.yml', 'utf8');
    const result = YAML.parse(file);
    result.workflows["cd-staging"].jobs.forEach(job => {
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