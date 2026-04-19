document.addEventListener('DOMContentLoaded', function() {
  const tocNav = document.getElementById('toc-nav');
  const tocToggle = document.getElementById('toc-toggle');
  const tocPanel = document.getElementById('toc-panel');
  const postToc = document.getElementById('post-toc');
  const content = document.querySelector('.post__content');

  if (!content || !tocNav) return;

  // Get all headings
  const headings = content.querySelectorAll('h1, h2, h3, h4');

  if (headings.length === 0) {
    postToc.style.display = 'none';
    return;
  }

  // Generate IDs for headings without them
  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = 'heading-' + index;
    }
  });

  // Build TOC
  const tocList = document.createElement('ul');
  tocList.className = 'post-toc__list';

  headings.forEach(heading => {
    const li = document.createElement('li');
    li.className = 'post-toc__item post-toc__item--' + heading.tagName.toLowerCase();

    const link = document.createElement('a');
    link.className = 'post-toc__link';
    link.href = '#' + heading.id;
    link.textContent = heading.textContent;
    link.addEventListener('click', function(e) {
      // Close mobile TOC after clicking
      if (window.innerWidth < 1200) {
        postToc.classList.remove('post-toc--open');
      }
    });

    li.appendChild(link);
    tocList.appendChild(li);
  });

  tocNav.appendChild(tocList);

  // Toggle mobile TOC
  tocToggle.addEventListener('click', function() {
    postToc.classList.toggle('post-toc--open');
  });

  // Close TOC when clicking outside
  document.addEventListener('click', function(e) {
    if (!postToc.contains(e.target) && postToc.classList.contains('post-toc--open')) {
      postToc.classList.remove('post-toc--open');
    }
  });

  // Highlight current section in TOC
  const tocLinks = tocNav.querySelectorAll('.post-toc__link');

  function highlightCurrentSection() {
    let current = '';

    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= 100) {
        current = heading.id;
      }
    });

    tocLinks.forEach(link => {
      link.classList.remove('post-toc__link--active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('post-toc__link--active');
      }
    });
  }

  window.addEventListener('scroll', highlightCurrentSection);
  highlightCurrentSection();

  // Code block copy buttons
  const codeBlocks = document.querySelectorAll('pre.highlight');

  codeBlocks.forEach(block => {
    // Wrap the code block
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    block.parentNode.insertBefore(wrapper, block);
    wrapper.appendChild(block);

    // Create copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'code-copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.type = 'button';
    wrapper.appendChild(copyBtn);

    copyBtn.addEventListener('click', async function() {
      const code = block.querySelector('code');
      const text = code ? code.textContent : block.textContent;

      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('code-copy-btn--copied');

        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('code-copy-btn--copied');
        }, 2000);
      } catch (err) {
        copyBtn.textContent = 'Failed';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
      }
    });
  });
});
