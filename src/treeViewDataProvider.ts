import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export class FileNode extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly resourceUri: vscode.Uri,
		public readonly root?: boolean,
		public readonly icon?: string
	) {
		super(label, collapsibleState);

		if (root) {
			this.iconPath = new vscode.ThemeIcon("folder");
			this.contextValue = "root";
		} else if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
			this.command = {
				command: "vscode.open",
				title: "打开文件",
				arguments: [this.resourceUri],
			};
			this.iconPath = new vscode.ThemeIcon(icon || "file");
			this.contextValue = "file";
		} else {
			this.iconPath = new vscode.ThemeIcon(icon || "folder");
			this.contextValue = "folder";
		}
	}
}

export class FileExplorerProvider implements vscode.TreeDataProvider<FileNode> {
	private _onDidChangeTreeData: vscode.EventEmitter<FileNode | undefined> = new vscode.EventEmitter<
		FileNode | undefined
	>();
	readonly onDidChangeTreeData: vscode.Event<FileNode | undefined> =
		this._onDidChangeTreeData.event;
	public treeView: vscode.TreeView<FileNode> | undefined;

	constructor(private workspaceRoot: string) {}

	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: FileNode): vscode.TreeItem {
		return element;
	}

	getChildren(element?: FileNode): FileNode[] {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage("没有打开的文件夹");
			return [];
		}

		let items: FileNode[] = [];

		if (element) {
			// 如果 element 存在，说明它是“当前目录”节点
			if (element.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed) {
				items = this.getFilesInDirectory(element.resourceUri.fsPath);
			} else {
				return [];
			}
		} else {
			// 如果没有父节点，将“当前目录”设置为根节点
			const rootItem = new FileNode(
				path.basename(this.workspaceRoot),
				vscode.TreeItemCollapsibleState.Collapsed, // 设置为可折叠状态
				vscode.Uri.file(this.workspaceRoot),
				true
			);
			rootItem.description = this.workspaceRoot;
			items.push(rootItem); // 将“当前目录”节点添加到 items 数组
		}

		// 排序：文件夹在上，文件在下
		items.sort((a, b) => {
			if (
				a.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed &&
				b.collapsibleState !== vscode.TreeItemCollapsibleState.Collapsed
			) {
				return -1;
			} else if (
				a.collapsibleState !== vscode.TreeItemCollapsibleState.Collapsed &&
				b.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed
			) {
				return 1;
			} else {
				return a.label.localeCompare(b.label);
			}
		});

		return items;
	}

	private getFilesInDirectory(dir: string): FileNode[] {
		const files = fs.readdirSync(dir);
		return files.map((file) => {
			const filePath = path.join(dir, file);
			const stat = fs.statSync(filePath);
			if (stat.isDirectory()) {
				return new FileNode(
					path.basename(filePath),
					vscode.TreeItemCollapsibleState.Collapsed,
					vscode.Uri.file(filePath)
				);
			} else {
				return new FileNode(
					path.basename(filePath),
					vscode.TreeItemCollapsibleState.None,
					vscode.Uri.file(filePath)
				);
			}
		});
	}

	getWorkspaceRoot(): string {
		return this.workspaceRoot;
	}

	findItem(uri: vscode.Uri): FileNode | undefined {
		const searchPath = uri.fsPath;
		const queue: FileNode[] = this.getChildren(); // 从根节点开始

		while (queue.length > 0) {
			const item = queue.shift(); // 取出当前项
			if (item) {
				// 检查当前项是否匹配
				if (item.resourceUri.fsPath === searchPath) {
					return item; // 找到匹配项
				}
				// 取出子项并添加到队列中
				const children = this.getChildren(item);
				queue.push(...children);
			}
		}
		return undefined; // 未找到匹配项
	}

	getParent(item: FileNode): FileNode | undefined {
		if (!item.resourceUri) {
			return undefined; // 如果没有有效的 URI，返回 undefined
		}

		const rootParentPath = path.dirname(this.workspaceRoot);
		const parentPath = path.dirname(item.resourceUri.fsPath);

		if (parentPath === rootParentPath) {
			return undefined;
		}

		// 返回有效的父节点
		return new FileNode(
			path.basename(parentPath),
			vscode.TreeItemCollapsibleState.Collapsed,
			vscode.Uri.file(parentPath),
			parentPath === this.workspaceRoot
		);
	}

	revealItem(fileUri: vscode.Uri) {
		const item = this.findItem(fileUri); // 查找新建的文件
		if (item) {
			this.treeView?.reveal(item, {
				select: true,
				focus: true,
				expand: true,
			});
		} else {
			vscode.window.showInformationMessage("未找到文件"); // 提示未找到文件
		}
	}
}
