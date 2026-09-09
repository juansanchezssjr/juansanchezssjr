class MarkdownModal extends HTMLElement {
	connectedCallback() {
		this.source = this.getAttribute('source');
		this.title = this.getAttribute('title') || 'Lectura';
		this.render();
		this.bindEvents();
	}

	render() {
		this.innerHTML = `
			<button class="markdown-modal__trigger" type="button">
				${this.title}
			</button>
			<dialog class="markdown-modal__dialog" aria-labelledby="markdown-modal-title">
				<div class="markdown-modal__toolbar">
					<h2 id="markdown-modal-title">${this.title}</h2>
					<button class="markdown-modal__close" type="button" aria-label="Cerrar lectura">Esc</button>
				</div>
				<article class="markdown-modal__content" aria-live="polite">
					<p>Cargando contenido...</p>
				</article>
			</dialog>
		`;
	}

	bindEvents() {
		this.dialog = this.querySelector('.markdown-modal__dialog');
		this.trigger = this.querySelector('.markdown-modal__trigger');
		this.closeButton = this.querySelector('.markdown-modal__close');
		this.content = this.querySelector('.markdown-modal__content');

		this.trigger.addEventListener('click', () => this.open());
		this.closeButton.addEventListener('click', () => this.close());
		this.dialog.addEventListener('click', (event) => {
			if (event.target === this.dialog) {
				this.close();
			}
		});
		this.dialog.addEventListener('close', () => {
			document.body.classList.remove('modal-is-open');
		});
	}

	async open() {
		document.body.classList.add('modal-is-open');
		this.dialog.showModal();

		try {
			const response = await fetch(this.source);
			if (!response.ok) {
				throw new Error(`No se pudo cargar ${this.source}`);
			}
			this.content.innerHTML = this.markdownToHtml(await response.text());
		} catch (error) {
			this.content.innerHTML = '<p>No se pudo cargar la lectura.</p>';
			console.error(error);
		}
	}

	close() {
		this.dialog.close();
	}

	markdownToHtml(markdown) {
		const lines = markdown.split(/\r?\n/);
		const output = [];
		let inList = false;

		for (const line of lines) {
			const trimmedLine = line.trim();
			const heading = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
			const listItem = trimmedLine.match(/^\*\s+(.+)$/);

			if (listItem) {
				if (!inList) {
					output.push('<ul>');
					inList = true;
				}
				output.push(`<li>${this.formatInline(listItem[1])}</li>`);
				continue;
			}

			if (inList) {
				output.push('</ul>');
				inList = false;
			}

			if (!trimmedLine) {
				continue;
			}

			if (heading) {
				const level = heading[1].length;
				output.push(`<h${level}>${this.formatInline(heading[2])}</h${level}>`);
				continue;
			}

			output.push(`<p>${this.formatInline(trimmedLine)}</p>`);
		}

		if (inList) {
			output.push('</ul>');
		}

		return output.join('');
	}

	formatInline(value) {
		const escaped = value
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;');
		return escaped
			.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
			.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	}
}

customElements.define('markdown-modal', MarkdownModal);
