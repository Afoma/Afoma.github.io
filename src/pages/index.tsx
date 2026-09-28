import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import styles from './index.module.css';

const projects = [
  {
    title: 'Demystifying Chainlink Automation v2.5',
    description:
      'A technical deep dive into Chainlink Automation, exploring its architecture, execution model, and implementation.',
    link: '/docs/chainlink-vrf-v2-5/Introduction/',
  },
  {
    title: 'Foundry Testing',
    description:
      'Exploring practical approaches to smart contract testing with Foundry, including unit, fuzz, and invariant testing.',
    link: '/docs/foundry-testing/intro',
  },
  {
    title: 'API Documentation',
    description:
      'Technical documentation covering API design, authentication, endpoints, and usage examples.',
    link: '/docs/api-documentation/intro',
  },
];

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <h1 className={styles.heroTitle}>Antoinette Orji</h1>

        <p className={styles.heroSubtitle}>
          Smart Contracts · Web3 · Backend
        </p>

        <p className={styles.heroDescription}>
          Technical projects, experiments, and deep dives into the systems
          I build and the things I learn.
        </p>
      </div>
    </header>
  );
}

function Projects() {
  return (
    <section className={styles.projects}>
      <div className="container">
        <h2>Projects</h2>

        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <article className={styles.projectCard} key={project.title}>
              <h3>{project.title}</h3>

              <p>{project.description}</p>

              <Link
                className="button button--primary"
                to={project.link}>
                Read project →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Technical Portfolio"
      description="Technical projects, documentation, experiments, and deep dives.">
      <HomepageHeader />
      <main>
        <Projects />
      </main>
    </Layout>
  );
}