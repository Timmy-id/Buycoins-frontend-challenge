const header = document.getElementById('header');
const form = document.getElementById('form');
const loginData = document.getElementById('login');
const button = document.getElementById('btn');
const profile = document.getElementById('profile');
const profileInfo = document.getElementById('profile-info');
const repoInfo = document.getElementById('repo-info');
const profileHeader = document.getElementById('profile-header');
const logo = document.getElementById('logo');
const logout = document.getElementById('logout');
const inputError = document.getElementById('inputError');

form.addEventListener('submit', e => {
    if (loginData.value === "" || loginData.value === null) {
        logo.remove();
        inputError.innerText = "Enter a github username"
    } else {
        const username = loginData.value;
        const user = getUserDetails(username);
        const repo = getRepoDetails(username);
        user.then(function(data) {
            profileInfo.innerHTML = ''
            logout.innerText = 'Back to Login Page';
            logout.classList.add('logout');

            // Add the profile image
            const profileImage = document.createElement('img');
            profileImage.src = data.avatarUrl;
            profileImage.classList.add('profile-img');
            profileInfo.append(profileImage);

            // Add the profile name
            const profileName = document.createElement('h3');
            profileName.innerHTML = data.name;
            profileName.classList.add('profile-name');
            profileInfo.append(profileName);

            // Add the login name
            const loginName = document.createElement('p');
            loginName.innerHTML = data.login;
            profileInfo.append(loginName);

            loginName.classList.add('login-name');

            // Add followers, following and starred repositories
            const element = document.createElement('div');
            element.classList.add('info-followers');
            const followers = document.createElement('p');
            followers.innerHTML = '<i class="fas fa-user-friends" aria-hidden="true"></i>' + data.followers.totalCount + " followers .";
            element.append(followers);
            const following = document.createElement('p');
            following.innerHTML = data.following.totalCount + " following";
            element.append(following);
            profileInfo.append(element);

            // Add address
            const address = document.createElement('p');
            address.innerHTML = '<i class="fas fa-map-marker-alt" aria-hidden="true"></i>' + data.location;
            profileInfo.append(address);

            // Add email
            const email = document.createElement('p');
            email.innerHTML = '<i class="far fa-envelope" aria-hidden="true"></i>' + data.email;
            profileInfo.append(email);

            // Add twitter username
            const twitterName = document.createElement('p');
            twitterName.innerHTML = '<i class="fab fa-twitter" aria-hidden="true"></i>' + data.twitterUsername;
            profileInfo.append(twitterName);
            profileInfo.append(logout);

            
            for (let userInfo in data) {
                form.remove();
                header.remove();
                profileHeader.classList.add('section-header');
            }
        })
        repo.then(function(data) {
            console.log(data)
            repoInfo.innerHTML = '';

            // Add the repositories
            let repositories = data.nodes;
            repositories.forEach(repo => {
                const element = document.createElement('div');
                const repoName = document.createElement('h4');
                const container = document.createElement('div');
                const languageName = document.createElement('p');
                const languageColor = document.createElement('small');
                const repoDate = document.createElement('p');
                repoName.innerHTML = repo.name;
                element.append(repoName);

                element.classList.add('repos');
                repoName.classList.add('repo-name');
                container.classList.add('repo-sub')
                repoDate.classList.add('repo-date');
                
                const languages = repo.languages.nodes;
                languages.forEach(language => {
                    languageColor.style.backgroundColor = language.color;
                    languageColor.classList.add('repo-color');
                    container.append(languageColor);
                    element.append(container);
                    repoInfo.append(element);

                    languageName.innerHTML = language.name;
                    container.append(languageName);
                    element.append(container);
                    repoInfo.append(element);
                })

                const formatDate = new Date(repo.updatedAt);
                const newDate = new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
                const updatedDate = newDate.format(formatDate);

                repoDate.innerHTML = "Updated on " + updatedDate;
                container.append(repoDate);
                element.append(container);
            });
        });
        logout.addEventListener("click", function() {
            return location.reload();
        })
    }
    e.preventDefault();
});

const github_data = {
    "token": "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"
}

const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + github_data["token"],
    Accept: 'application/json'
}

const url = "https://api.github.com/graphql";

function getUserDetails(username) {
    return queryFetch(`
        query getUsername($login: String!) {
            user(login: $login) {
                login,
                bio,
                name,
                avatarUrl,
                followers{
                    totalCount
                },
                following{
                    totalCount
                },
                starredRepositories{
                    totalCount
                },
                location,
                email,
                twitterUsername,
                websiteUrl
            }
        }`, { login: username }).then(data => {
            return data.data.user;
        }).catch(err => console.log(err))
}

function getRepoDetails(username) {
    return queryFetch(`
        query getUsername($login: String!) {
            repositoryOwner(login: $login) {
                repositories(last: 20) {
                    totalCount,
                    nodes {
                        name,
                        stargazerCount,
                        forkCount,
                        updatedAt,
                        languages(first: 10) {
                            nodes {
                              name,
                              color
                            }
                        }
                    }
                }
            }
        }`, { login: username }).then(data => {
            return data.data.repositoryOwner.repositories;
        }).catch(err => console.log(err))
}

async function queryFetch(query, variables) {
    const res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    });
    return await res.json();
}