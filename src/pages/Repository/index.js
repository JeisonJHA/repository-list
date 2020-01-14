import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, PageHandler } from './styles';

export default function Repository({ match }) {
  const [repositoryName, setRepositoryName] = useState('');
  const [repository, setRepository] = useState({});
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstPage, setFirstPage] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async repoName => {
      const [repo, isss] = await Promise.all([
        api.get(`/repos/${repoName}`),
        api.get(`/repos/${repoName}/issues`, {
          params: {
            state: 'open',
            per_page: 5,
          },
        }),
      ]);
      setRepository(repo.data);
      setIssues(isss.data);
      setLoading(false);
    };
    const repoName = decodeURIComponent(match.params.repository);
    setRepositoryName(repoName);
    fetch(repoName);
  }, [match.params.repository]);

  const priorPage = async () => {
    setPage(page - 1);
    const newPage = await api.get(`/repos/${repositoryName}/issues`, {
      params: {
        page: page - 1,
        state: 'open',
        per_page: 5,
      },
    });
    setIssues(newPage.data);
    setFirstPage(page - 1 === 1);
  };

  const nextPage = async () => {
    setPage(page + 1);
    const newPage = await api.get(`/repos/${repositoryName}/issues`, {
      params: {
        page: page + 1,
        state: 'open',
        per_page: 5,
      },
    });
    setIssues(newPage.data);
    setFirstPage(false);
  };

  if (loading) {
    return <Loading>Carregando</Loading>;
  }

  return (
    <Container>
      <Owner>
        <Link to="/">Voltar aos repositórios</Link>
        <img src={repository.owner.avatar_url} alt={repository.owner.login} />
        <h1>{repository.name}</h1>
        <p>{repository.description}</p>
      </Owner>

      <IssueList>
        {issues.map(issue => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />
            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>
                {issue.labels.map(label => (
                  <span key={String(label.id)}>{label.name}</span>
                ))}
              </strong>
              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
      </IssueList>
      <PageHandler>
        <button type="button" disabled={firstPage} onClick={priorPage}>
          <FaArrowLeft />
        </button>
        <button type="button" onClick={nextPage}>
          <FaArrowRight />
        </button>
      </PageHandler>
    </Container>
  );
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
