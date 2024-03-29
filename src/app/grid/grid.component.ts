import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NoPathComponent } from '../no-path/no-path.component';
import { MobileMessageComponent } from '../mobile-message/mobile-message.component';


interface Node {
  row: number;
  col: number;
  isStart: boolean;
  isEnd: boolean;
  distance: number;
  isVisited: boolean;
  isWall: boolean;
  previousNode: Node | null;
}

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})

export class GridComponent implements OnInit {

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private nodes: Node[][] = [];
  private startNode!: Node;
  private endNode!: Node;
  private numRows = 40;
  private numCols = 40;
  private cellWidth = 20;
  private cellHeight = 20;
  private canvasHeight:any;
  private canvasWidth:any;
  private draggingNode: 'start' | 'end' | 'clear' | null = null;
  private isDrawing = false;
  private isDragging = false;
  private failed = false;
  private pathColorInput!: HTMLInputElement;
  private visitedNodeColorInput!: HTMLInputElement;
  private visitedNodeColor = '#ffff00';
  private pathColor = '#ff00fb';

  rainbow = false;
  delayTime = 1;
  resetColor = false;


  constructor(public dialog: MatDialog) { }

  // ngAfterViewInit() {
  ngOnInit() {
    if (this.isMobileDevice()) {
      this.displayMobileMessage();
      this.canvas.nativeElement.addEventListener('touchstart', (event) => this.onMouseDown(event));
      this.canvas.nativeElement.addEventListener('touchmove', (event) => this.onMouseMove(event));
    }
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    if (this.canvas.nativeElement.parentElement == null) {
      throw new Error("error");
    }
    else {
      this.visitedNodeColorInput = document.getElementById('visited') as HTMLInputElement;
      this.pathColorInput = document.getElementById('Path') as HTMLInputElement;
      const containerHeight = this.canvas.nativeElement.parentElement.clientHeight;
      const containerWidth = this.canvas.nativeElement.parentElement.clientWidth;
      if (this.isMobileDevice()) {
        this.canvasHeight = Math.floor(containerHeight / this.cellHeight) * (this.cellHeight * 4);
        this.canvasWidth = Math.floor(containerWidth / this.cellWidth) * (this.cellWidth);
      }
      else {
        this.canvasHeight = Math.floor(containerHeight / this.cellHeight) * (this.cellHeight * 3);
        this.canvasWidth = Math.floor(containerWidth / this.cellWidth) * (this.cellWidth);
      }
      this.canvas.nativeElement.height = this.canvasHeight;
      this.canvas.nativeElement.width = this.canvasWidth;
      this.numRows = Math.floor(this.canvasHeight / this.cellHeight);
      this.numCols = Math.floor(this.canvasWidth / this.cellWidth);
      // console.log(this.numRows,this.numCols);
      this.createGraph();
      this.drawGraph();
      let startRow = Math.floor(Math.random() * this.numRows);
      let startCol = Math.floor(Math.random() * this.numCols);
      let endRow = Math.floor(Math.random() * this.numRows);
      let endCol = Math.floor(Math.random() * this.numCols);
      let start = this.nodes[startRow][startCol];
      let end = this.nodes[endRow][endCol];
      // console.log(start,end);
      this.createEndNode(end);
      this.createStartNode(start);

    }
    // window.addEventListener('resize', () => {
    //   this.updateCanvasSize();
    // });
  }

  // updateCanvasSize() {
  //   const containerHeight = this.canvas.nativeElement.parentElement!.clientHeight;
  //   const containerWidth = this.canvas.nativeElement.parentElement!.clientWidth;
  //   this.canvasHeight = Math.floor(containerHeight / this.cellHeight) * (this.cellHeight * 3);
  //   this.canvasWidth = Math.floor(containerWidth / this.cellWidth) * (this.cellWidth);
  //   this.canvas.nativeElement.height = this.canvasHeight;
  //   this.canvas.nativeElement.width = this.canvasWidth;
  //   this.numRows = Math.floor(this.canvasHeight / this.cellHeight);
  //   this.numCols = Math.floor(this.canvasWidth / this.cellWidth);
  //   this.createGraph();
  //   this.drawGraph();
  // }

  createGraph() {
    for (let row = 0; row < this.numRows; row++) {
      const currentRow: Node[] = [];
      for (let col = 0; col < this.numCols; col++) {
        const node: Node = {
          row: row,
          col: col,
          isStart: false,
          isEnd: false,
          distance: Infinity,
          isVisited: false,
          isWall: false,
          previousNode: null,
        };
        currentRow.push(node);
      }
      this.nodes.push(currentRow);
    }
  }

  drawGraph() {
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        const x = col * this.cellWidth;
        const y = row * this.cellHeight;
        this.ctx.beginPath();
        this.ctx.rect(x, y, this.cellWidth, this.cellHeight);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.stroke();
      }
    }
  }
  onMouseDown(event: MouseEvent | TouchEvent) {
    if (event instanceof MouseEvent) {
      if (this.isMobileDevice()) {
        event.preventDefault();
      }
      else {
        const col = Math.floor(event.offsetX / this.cellWidth);
        const row = Math.floor(event.offsetY / this.cellHeight);
        const node = this.nodes[row][col];
        // console.log(event.offsetX);
        // console.log(node);
        // check if click is within start node, without this, anywhere the user clicks
        // the start/end node moves to that box.
        if (node == this.startNode) {
          this.isDragging = true;
          this.isDrawing = false;
          this.draggingNode = 'start';
          return;
        }
        // check if click is within end node
        else if (node == this.endNode) {
          this.isDragging = true;
          this.isDrawing = false;
          this.draggingNode = 'end';
          return;
        }
        else if (!node.isWall) {
          this.isDragging = false;
          this.isDrawing = true;
          this.draggingNode = null;
          this.createWall(node);
        }
        else {
          this.isDragging = false;
          this.isDrawing = true;
          this.draggingNode = 'clear';
          this.clearNode(node);
          return;
        }
      }
    }
    else if (event instanceof TouchEvent) {
      event.preventDefault();
    }

  }

  onMouseMove(event: MouseEvent | TouchEvent) {
    try {
      if (event instanceof MouseEvent) {
        if (this.isMobileDevice()) {
          event.preventDefault();
        }
        else {
          const col = Math.floor(event.offsetX / this.cellWidth);
          const row = Math.floor(event.offsetY / this.cellHeight);
          const currNode = this.nodes[row][col];
          // console.log(currNode);
          //start - 500, 300 -> 501,301
          if (this.isDragging) {
            // update the position of the dragged node by gathering info about the current state
            // and next state. Update previous state with white, paint next state.
            if (this.draggingNode == 'start' && currNode != this.endNode) {
              const prevLocation = this.nodes[this.startNode.row][this.startNode.col];
              prevLocation.distance = Infinity;
              this.clearNode(prevLocation);
              this.createStartNode(currNode);
            }
            else if (this.draggingNode == 'end' && currNode != this.startNode) {
              const prevLocation = this.nodes[this.endNode.row][this.endNode.col];
              prevLocation.distance = Infinity;
              this.clearNode(prevLocation);
              this.createEndNode(currNode);
            }
          }

          else if (this.isDrawing && this.endNode != currNode && this.startNode != currNode && this.draggingNode == null) {
            this.createWall(currNode);
          }
          else if (this.isDrawing && this.draggingNode == 'clear' && currNode != this.startNode && currNode != this.endNode) {
            // console.log("hi");
            this.clearNode(currNode);
          }
          this.drawGraph();
        }
      }
      else if (event instanceof TouchEvent) {
        event.preventDefault();
      }
    }
    catch (e) { }
  }


  onMouseUp(event: MouseEvent) {
    this.isDragging = false;
    this.isDrawing = false;
    this.draggingNode = null;
  }

  private drawNode(node: Node, color: string) {
    const x = (node.col * this.cellWidth);
    const y = node.row * this.cellHeight;
    // console.log(x,y)
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
  }

  private clearNode(node: Node) {
    const x = node.col * this.cellWidth;
    const y = node.row * this.cellHeight;
    this.ctx.clearRect(x, y, this.cellWidth, this.cellHeight);
    node.isStart = false;
    node.isEnd = false;
    node.isWall = false;
    node.distance = Infinity;
    node.previousNode = null;
    node.isVisited = false;
  }
  private createStartNode(node: Node) {
    this.startNode = node;
    this.startNode.row = node.row;
    this.startNode.col = node.col;
    this.startNode.isStart = true;
    this.startNode.isEnd = false;
    this.startNode.distance = 0;
    this.startNode.isWall = false;
    this.startNode.previousNode = null;
    this.drawNode(this.startNode, '#59ff00');

  }

  private createEndNode(node: Node) {
    this.endNode = node;
    this.endNode.row = node.row;
    this.endNode.col = node.col;
    this.endNode.isStart = false;
    this.endNode.isEnd = true;
    this.endNode.distance = Infinity;
    this.endNode.isWall = false;
    this.endNode.previousNode = null;
    this.drawNode(node, 'red');
  }

  private createWall(node: Node) {
    node.isWall = true;
    node.isEnd = false;
    this.drawNode(node, 'black');
  }

  // Main runner
  async runDijkstra() {

    this.visitedNodeColor = this.visitedNodeColorInput.value;
    // console.log(this.visitedNodeColor);
    // console.log(this.startNode, this.endNode);
    if (this.startNode == undefined || this.endNode == undefined) {
      this.reset();
      return;
    }
    const unvisitedNodes = this.getAllNodes();

    while (unvisitedNodes.length) {
      this.sortNodesByDistance(unvisitedNodes);
      const closestNode = unvisitedNodes.shift()!;
      if (closestNode != this.startNode && closestNode != this.endNode) {
        if (this.rainbow) {
          // await new Promise(resolve => setTimeout(resolve, this.delayTime));
          await new Promise(resolve => setTimeout(resolve, 5));
          this.drawNode(closestNode, this.generateColor());
        }
        else {
          // await new Promise(resolve => setTimeout(resolve, this.delayTime));
          await new Promise(resolve => setTimeout(resolve, 5));
          // this.drawNode(closestNode,'yellow');
          this.drawNode(closestNode, this.visitedNodeColor);
        }
      }
      if (closestNode.distance == Infinity) {
        break;
      }
      if (!closestNode.isStart && !closestNode.isEnd) {
        closestNode.isVisited = true;
      }
      if (closestNode.isEnd || closestNode.col == this.endNode.col && closestNode.row == this.endNode.row) {
        closestNode.isEnd = true;
        this.endNode = closestNode;
        this.getShortestPath();
        this.createEndNode(closestNode);
        return;
      }
      this.updateUnvisitedNeighbors(closestNode);
    }
    this.failed = true;
    //Display NoPathComponent if there is no path found.
    if (this.failed) {
      this.dialog.open(NoPathComponent);
    }
  }


  // Makes an Array of all Nodes in Grid.
  getAllNodes(): Node[] {
    const nodes: Node[] = [];
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        nodes.push(this.nodes[row][col]);
      }
    }
    return nodes;

  }

  // Sorts Nodes by Distance to determine path
  sortNodesByDistance(nodes: Node[]) {
    nodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
  }

  // Updates the unvisited neighbors
  updateUnvisitedNeighbors(node: Node) {
    const unvisitedNeighbors = this.getUnvisitedNeighbors(node);
    for (const neighbor of unvisitedNeighbors) {
      const distance = node.distance + this.getDistance(node, neighbor);
      if (distance < neighbor.distance) {
        neighbor.distance = distance;
        neighbor.previousNode = node;
      }
    }
    this.drawGraph();
  }

  // Returns all surrounding nodes that arent a wall or visited given a node as a parameter
  getUnvisitedNeighbors(node: Node) {
    const neighbors: Node[] = [];
    const { col, row } = node;
    if (row > 0) {
      neighbors.push(this.nodes[row - 1][col]);
    }
    if (row < this.numRows - 1) {
      neighbors.push(this.nodes[row + 1][col]);
    }
    if (col > 0) {
      neighbors.push(this.nodes[row][col - 1]);
    }
    if (col < this.numCols - 1) {
      neighbors.push(this.nodes[row][col + 1]);
    }
    return neighbors.filter(neighbor => !neighbor.isVisited && !neighbor.isWall);
  }

  // Gets Distance between two nodes
  getDistance(nodeA: Node, nodeB: Node) {
    const distanceX = Math.abs(nodeA.col - nodeB.col);
    const distanceY = Math.abs(nodeA.row - nodeB.row);
    return distanceX + distanceY;
  }

  // Sorted by distance, traverse the path.
  getShortestPath() {
    const path: Node[] = [];
    let currentNode: Node | null = this.endNode;
    while (currentNode != null) {
      path.unshift(currentNode);
      currentNode = currentNode.previousNode;
      // console.log(path);
    }
    this.drawShortestPath(path);
  }


  async drawShortestPath(path: Node[]) {
    this.pathColor = this.pathColorInput.value;
    // console.log(path);
    {
      for (let i = 0; i < path.length - 1; i++) {
        const node = path[i + 1];
        if (node != this.endNode) {
          await new Promise(resolve => setTimeout(resolve, 10));
          this.drawNode(node, this.pathColor);
        }

      }
    }
    this.ctx.stroke();
  }
  // }

  reset() {
    try {
      console.clear();
      this.createGraph();
      for (let row = 0; row < this.numRows; row++) {
        for (let col = 0; col < this.numCols; col++) {
          const node = this.nodes[row][col];
          const x = col * this.cellWidth;
          const y = row * this.cellHeight;
          this.clearNode(node);
          this.ctx.beginPath();
          this.ctx.rect(x, y, this.cellWidth, this.cellHeight);
          this.ctx.strokeStyle = '#ccc';
          this.ctx.stroke();
          this.clearNode(node);
        }
      }
      let startRow = Math.floor(Math.random() * this.numRows);
      let startCol = Math.floor(Math.random() * this.numCols);
      let endRow = Math.floor(Math.random() * this.numCols);
      let endCol = Math.floor(Math.random() * this.numCols);
      let start = this.nodes[startRow][startCol];
      let end = this.nodes[endRow][endCol];
      end.isEnd = true;
      start.isStart = true;
      this.createEndNode(end);
      this.createStartNode(start);
      // console.log(start, end);
      if (this.resetColor) {
        if (this.rainbow) {
          this.pathColorInput.value = '#ffffff';
        }
        else {
          this.visitedNodeColorInput.value = '#ffff00';
          this.pathColorInput.value = '#ff00fb';
        }
      }
      this.resetColor = true;
    }
    catch (e) { console.log(e); }
  }

  randomize() {
    this.resetColor = false;
    this.reset();
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        const node = this.nodes[row][col];
        const x = col * this.cellWidth;
        const y = row * this.cellHeight;
        this.ctx.beginPath();
        this.ctx.rect(x, y, this.cellWidth, this.cellHeight);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.stroke();
        let rand = Math.random();
        if (node.isEnd || node.isStart) {
          // console.log(node);
        }
        if (rand < 0.35 && !node.isEnd && !node.isStart && this.nodes[row][col] != this.nodes[this.startNode.row][this.startNode.col]
          && this.nodes[row][col] != this.nodes[this.endNode.row][this.endNode.col]) {
          this.createWall(node);
        }
      }
    }
  }
  generateColor(): string {
    let hexSet = "0123456789ABCDEF";
    let finalHexString = "#";
    for (let i = 0; i < 6; i++) {
      finalHexString += hexSet[Math.ceil(Math.random() * 15)];
    }
    return finalHexString;
  }

  rainbowToggle() {
    this.rainbow = !this.rainbow;
    if (this.rainbow) {
      this.pathColorInput.value = '#ffffff';
    }
    else {
      this.pathColorInput.value = '#ff00fb';
    }
  }

  //No longer changing speed of render.
  delayChange(value: number): string {
    if (value > 100) {
      return Math.round(value).toString();
    }
    this.delayTime = Number(`${value}`);
    // console.log(this.delayTime, value);
    return `${value}`;
  }

  isMobileDevice(): boolean {
    return /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
  }

  displayMobileMessage() {
    this.dialog.open(MobileMessageComponent);
  }

}


